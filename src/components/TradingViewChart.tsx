// src/components/TradingViewChart.tsx

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  createChart,
  IChartApi,
  ColorType,
  CrosshairMode,
  LineStyle,
  PriceScaleMode,
  ISeriesApi,
  Time,
  DeepPartial,
  ChartOptions,
} from 'lightweight-charts';
import debounce from 'lodash.debounce'; // Ensure you have lodash.debounce installed
import { Settings2, HelpCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from 'src/misc/cn'; // Using existing utility
import { getBarsWithFallback, getPairLiquidity } from './TradingViewChart/codexApi';
import { TokenInfo } from '@solana/spl-token-registry';
import { formatNumber } from 'src/misc/utils';

interface TimeframeOption {
  label: string;
  value: string;
  lookback: number;
  tooltipText: string; // Added for better UX
}

const TIMEFRAMES: TimeframeOption[] = [
  { label: '1m', value: '1', lookback: 60 * 60, tooltipText: '1 Minute intervals' },
  { label: '5m', value: '5', lookback: 4 * 60 * 60, tooltipText: '5 Minute intervals' },
  { label: '15m', value: '15', lookback: 24 * 60 * 60, tooltipText: '15 Minute intervals' },
  { label: '1h', value: '60', lookback: 7 * 24 * 60 * 60, tooltipText: '1 Hour intervals' },
  { label: '4h', value: '240', lookback: 30 * 24 * 60 * 60, tooltipText: '4 Hour intervals' },
  { label: '1D', value: '1D', lookback: 180 * 24 * 60 * 60, tooltipText: 'Daily intervals' },
];

const CHART_ANIMATION_DURATION = 400; // ms

interface PairStats {
  liquidity: string;
  volume24h?: string;
  priceChange24h?: number;
}

export default function TradingViewChart({
  fromMint,
  toMint,
  defaultResolution = '1',
  className = '',
  pairAddress,
  fromTokenInfo,
  toTokenInfo,
}: {
  fromMint: string;
  toMint: string;
  defaultResolution?: string;
  className?: string;
  pairAddress: string;
  fromTokenInfo?: TokenInfo;
  toTokenInfo?: TokenInfo;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(
    TIMEFRAMES.find((tf) => tf.value === defaultResolution) || TIMEFRAMES[2]
  );
  const [displayedToken, setDisplayedToken] = useState<'destination' | 'source' | null>(null);

  // Simplified state without unused features
  const [showVolume, setShowVolume] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [pairStats, setPairStats] = useState<{
    liquidity?: string;
    volume24h?: string;
    priceChange24h?: number;
  } | null>(null);

  const [priceSource, setPriceSource] = useState<'direct' | 'stablePair' | 'solPair' | null>(null);

  // Token display helper
  const getTokenDisplay = () => {
    if (!fromTokenInfo || !toTokenInfo) return null;

    const isFromStable = ['USDC', 'USDT', 'UST'].includes(fromTokenInfo.symbol);
    const isToStable = ['USDC', 'USDT', 'UST'].includes(toTokenInfo.symbol);

    if (isFromStable) {
      return `${toTokenInfo.symbol} Price`;
    } else if (isToStable) {
      return `${fromTokenInfo.symbol} Price`;
    } else {
      return `${fromTokenInfo.symbol}/${toTokenInfo.symbol}`;
    }
  };

  // Add data validation state
  const [dataValidated, setDataValidated] = useState(false);

  // Track previous timeframe for animations
  const prevTimeframeRef = useRef(defaultResolution);

  // Introduce currentPair state to stabilize updates
  const [currentPair, setCurrentPair] = useState({ fromMint: '', toMint: '' });

  // Enhanced updateChartData with better error handling and price source tracking
  const updateChartData = useCallback(async () => {
    if (!chart.current || !currentPair.fromMint || !currentPair.toMint) {
      console.log('Missing required data for chart update');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPriceSource(null);

    try {
      const now = Math.floor(Date.now() / 1000);
      const lookbackTime = now - selectedTimeframe.lookback;
      console.log('Fetching data with params:', {
        fromMint: currentPair.fromMint,
        toMint: currentPair.toMint,
        from: lookbackTime,
        to: now,
        resolution: selectedTimeframe.value,
      });
      const { bars, source } = await getBarsWithFallback(
        currentPair.fromMint,
        currentPair.toMint,
        lookbackTime,
        now,
        selectedTimeframe.value
      );

      if (!bars || bars.length === 0) {
        throw new Error('No price data available for this pair');
      }

      setPriceSource(source);

      // Safety check for chart existence after async operation
      if (!chart.current) {
        console.warn('Chart instance lost during data fetch');
        return;
      }

      // Clear existing series with safety checks
      if (candleSeries.current) {
        try {
          chart.current.removeSeries(candleSeries.current);
          candleSeries.current = null;
        } catch (error) {
          console.warn('Error removing candle series:', error);
        }
      }
      if (volumeSeries.current) {
        try {
          chart.current.removeSeries(volumeSeries.current);
          volumeSeries.current = null;
        } catch (error) {
          console.warn('Error removing volume series:', error);
        }
      }

      // Create new series
      try {
        // Add volume series first so it appears behind candles
        if (showVolume) {
          volumeSeries.current = chart.current.addHistogramSeries({
            color: 'rgba(20, 241, 149, 0.5)',
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
          });

          // Configure the price scale for the volume series
          chart.current.priceScale('volume').applyOptions({
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });
        }

        candleSeries.current = chart.current.addCandlestickSeries({
          upColor: '#14F195',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#14F195',
          wickDownColor: '#ef4444',
          priceFormat: {
            type: 'price',
            precision: 6,
            minMove: 0.000001,
          },
        });

        // Prepare and set data
        const candleData = bars.map((bar) => ({
          time: bar.time / 1000 as Time,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }));

        const volumeData = bars.map((bar) => ({
          time: bar.time / 1000 as Time,
          value: bar.volume,
          color: bar.close >= bar.open ? 'rgba(20, 241, 149, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        }));

        candleSeries.current.setData(candleData);
        if (showVolume && volumeSeries.current) volumeSeries.current.setData(volumeData);

        console.log(
          'Chart data set with:',
          candleData.length,
          'candles and',
          showVolume ? volumeData.length : 0,
          'volume bars'
        );

        // Set which token's data we're showing
        if (pairAddress) {
          setDisplayedToken('destination');
        } else {
          setDisplayedToken('source');
        }

        // Ensure proper scaling
        chart.current.timeScale().fitContent();
      } catch (error) {
        console.error('Error setting up chart series:', error);
        throw new Error('Failed to set up chart series');
      }
    } catch (err) {
      console.error('Chart update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data';
      setError(errorMessage);
      setPriceSource(null);
      setDisplayedToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPair, selectedTimeframe.lookback, selectedTimeframe.value, pairAddress, showVolume]);

  // Debounced chart update to prevent rapid redraws
  const debouncedChartUpdate = useMemo(
    () =>
      debounce(() => {
        updateChartData();
      }, 300),
    [updateChartData]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedChartUpdate.cancel();
    };
  }, [debouncedChartUpdate]);

  // Enhanced data validation
  const validatePairStats = useCallback((stats: PairStats | null): boolean => {
    if (!stats) return false;
    return (
      typeof stats.liquidity === 'string' &&
      !isNaN(parseFloat(stats.liquidity)) &&
      (stats.volume24h === undefined ||
        (typeof stats.volume24h === 'string' && !isNaN(parseFloat(stats.volume24h)))) &&
      (stats.priceChange24h === undefined ||
        (typeof stats.priceChange24h === 'number' && !isNaN(stats.priceChange24h)))
    );
  }, []);

  // Enhanced fetch pair statistics with validation
  const fetchPairStats = useCallback(async () => {
    if (!pairAddress) {
      setPairStats(null);
      setDataValidated(false);
      return;
    }
    try {
      console.log('Fetching stats for pair:', pairAddress);
      const stats = await getPairLiquidity(pairAddress);
      console.log('Received pair stats:', stats);
      if (validatePairStats(stats)) {
        setPairStats(stats);
        setDataValidated(true);
      } else {
        console.error('Invalid pair stats data:', stats);
        setPairStats(null);
        setDataValidated(false);
      }
    } catch (error) {
      console.error('Failed to fetch pair stats:', error);
      setPairStats(null);
      setDataValidated(false);
    }
  }, [pairAddress, validatePairStats]);

  // Smooth timeframe transition
  const handleTimeframeChange = useCallback(
    (newTimeframe: TimeframeOption) => {
      const prevTimeframe = prevTimeframeRef.current;
      prevTimeframeRef.current = newTimeframe.value;
      setSelectedTimeframe(newTimeframe);
      if (chart.current) {
        // Save current visible range
        const visibleRange = chart.current.timeScale().getVisibleRange();

        // Update with animation
        debouncedChartUpdate();

        // Smooth transition of visible range
        if (visibleRange) {
          const transition = setTimeout(() => {
            // Double check chart still exists after timeout
            if (chart.current && chart.current.timeScale()) {
              try {
                chart.current.timeScale().setVisibleRange({
                  from: visibleRange.from as Time,
                  to: visibleRange.to as Time,
                });
              } catch (error) {
                console.warn('Failed to set visible range:', error);
                // Fallback to fitting content
                chart.current.timeScale().fitContent();
              }
            }
          }, CHART_ANIMATION_DURATION);
          return () => clearTimeout(transition);
        }
      }
    },
    [debouncedChartUpdate]
  );

  // Format stats values with proper precision
  const formatStatValue = useCallback(
    (value: string | number | undefined, type: 'currency' | 'percentage'): string => {
      if (value === undefined || value === '') return '-';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '-';
      if (type === 'currency') {
        if (numValue === 0) return '$0';
        if (Math.abs(numValue) < 0.01) return '<$0.01';
        return `$${formatNumber.format(numValue.toString())}`;
      } else {
        return `${numValue > 0 ? '+' : ''}${numValue.toFixed(2)}%`;
      }
    },
    []
  );

  // Enhanced create chart instance with better interaction handling
  const createChartInstance = useCallback(() => {
    if (!chartContainerRef.current) return null;

    const symbol = pairAddress ? `${pairAddress}:1399811149` : `${fromMint}:1399811149`;
    console.log('Constructed Symbol:', symbol);

    const chartOptions: DeepPartial<ChartOptions> = {
      layout: {
        background: { type: ColorType.Solid, color: 'rgb(19, 17, 28)' },
        textColor: '#d1d5db',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif', // Ensure consistent font
      },
      grid: {
        vertLines: {
          color: showGrid ? 'rgba(43, 43, 67, 0.5)' : 'transparent',
          style: LineStyle.Dotted,
        },
        horzLines: {
          color: showGrid ? 'rgba(43, 43, 67, 0.5)' : 'transparent',
          style: LineStyle.Dotted,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.4)',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: 'rgb(43, 43, 67)',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.4)',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: 'rgb(43, 43, 67)',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(43, 43, 67, 0.8)',
        rightOffset: 12,
        barSpacing: 6,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true, // Improve scrolling behavior
        minBarSpacing: 4, // Prevent bars from overlapping
      },
      rightPriceScale: {
        borderColor: 'rgba(43, 43, 67, 0.8)',
        autoScale: true,
        mode: PriceScaleMode.Normal,
        alignLabels: true,
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.2 : 0.1, // Adjust based on volume visibility
        },
        entireTextOnly: true, // Prevent price label cutoff
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
    };

    return createChart(chartContainerRef.current, chartOptions);
  }, [fromMint, pairAddress, showGrid, showVolume]);

  // Initialize chart
  useEffect(() => {
    let chartInstance: IChartApi | null = null;
    if (!chart.current && chartContainerRef.current) {
      chartInstance = createChartInstance();
      chart.current = chartInstance;
      updateChartData();
    }
    return () => {
      if (chartInstance) {
        try {
          chartInstance.remove();
        } catch (error) {
          console.warn('Error cleaning up chart:', error);
        }
      }
      chart.current = null;
      candleSeries.current = null;
      volumeSeries.current = null;
      console.log('Chart cleanup completed');
    };
  }, [createChartInstance, updateChartData]);

  // Stabilization check to prevent unnecessary updates
  const shouldUpdateChart = useCallback(
    (newFromMint: string, newToMint: string) => {
      return newFromMint !== currentPair.fromMint || newToMint !== currentPair.toMint;
    },
    [currentPair]
  );

  useEffect(() => {
    if (shouldUpdateChart(fromMint, toMint)) {
      console.log('Meaningful pair change detected, updating chart...');
      setCurrentPair({ fromMint, toMint });
      updateChartData();
    }
  }, [fromMint, toMint, shouldUpdateChart, updateChartData]);

  // Effect to fetch pair stats
  useEffect(() => {
    fetchPairStats();
  }, [fetchPairStats]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
        console.log('Chart resized to width:', chartContainerRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug prop changes
  useEffect(() => {
    console.log('TradingViewChart Props Updated:', { fromMint, toMint, pairAddress });
  }, [fromMint, toMint, pairAddress]);

  return (
    <div className={cn('relative rounded-lg bg-[#13111C] p-4', className)}>
      {/* Stats Panel with enhanced data display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Liquidity"
          value={formatStatValue(pairStats?.liquidity, 'currency')}
          icon={<DollarSign className="w-4 h-4 text-[#14F195]" />}
          tooltip="Total value locked in this trading pair"
          isLoading={!dataValidated}
        />
        <StatsCard
          title="24h Volume"
          value={formatStatValue(pairStats?.volume24h, 'currency')}
          icon={<TrendingUp className="w-4 h-4 text-[#14F195]" />}
          tooltip="Trading volume in the last 24 hours"
          isLoading={!dataValidated}
        />
        <StatsCard
          title="24h Change"
          value={formatStatValue(pairStats?.priceChange24h, 'percentage')}
          icon={<Activity className="w-4 h-4 text-[#14F195]" />}
          tooltip="Price change in the last 24 hours"
          valueClassName={cn(
            pairStats?.priceChange24h !== undefined &&
              (pairStats.priceChange24h > 0
                ? 'text-green-500'
                : pairStats.priceChange24h < 0
                ? 'text-red-500'
                : '')
          )}
          isLoading={!dataValidated}
        />
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Token Display */}
          {fromTokenInfo && toTokenInfo && (
            <div className="text-sm bg-[#14F195]/10 text-[#14F195] px-2 py-1 rounded">
              {getTokenDisplay()}
            </div>
          )}
        </div>

        {/* Settings Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <Settings2 className="w-4 h-4 text-gray-400" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="bg-gray-800 rounded-lg p-4 shadow-lg z-50"
              sideOffset={5}
            >
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-gray-200">Chart Settings</h3>
                <div className="space-y-3">
                  {/* Show Volume Toggle */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-300">Show Volume</span>
                    <button
                      onClick={() => setShowVolume(!showVolume)}
                      className={cn(
                        'w-9 h-5 rounded-full transition-colors focus:outline-none',
                        showVolume ? 'bg-[#14F195]' : 'bg-gray-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-3.5 h-3.5 bg-white rounded-full transition-transform',
                          showVolume ? 'translate-x-5' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </label>
                  {/* Show Grid Toggle */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-300">Show Grid</span>
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={cn(
                        'w-9 h-5 rounded-full transition-colors focus:outline-none',
                        showGrid ? 'bg-[#14F195]' : 'bg-gray-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-3.5 h-3.5 bg-white rounded-full transition-transform',
                          showGrid ? 'translate-x-5' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </label>
                </div>
              </div>
              <Popover.Arrow className="fill-gray-800" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => handleTimeframeChange(tf)}
            className={cn(
              'px-3 py-1 rounded transition-colors',
              selectedTimeframe.value === tf.value
                ? 'bg-[#14F195] text-black font-medium'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            )}
            title={tf.tooltipText} // Added tooltip for better UX
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14F195]" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <div className="text-red-500 bg-black/40 p-4 rounded-lg text-center">
              <p className="font-medium mb-1">Unable to load price data</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>
    </div>
  );
}

// Enhanced StatsCard with loading state
const StatsCard = ({
  title,
  value,
  icon,
  tooltip,
  valueClassName = '',
  isLoading = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tooltip: string;
  valueClassName?: string;
  isLoading?: boolean;
}) => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <div
        className={cn(
          'group relative bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/40 transition-all cursor-pointer',
          isLoading && 'animate-pulse'
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm text-gray-300">{title}</span>
        </div>
        <div className={cn('text-lg font-medium mt-1', isLoading ? 'text-gray-500' : valueClassName)}>
          {isLoading ? 'Loading...' : value}
        </div>
      </div>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        className="absolute -top-1 left-1/2 bg-gray-900 text-xs text-gray-300 px-2 py-1 rounded whitespace-nowrap"
        sideOffset={5}
      >
        {tooltip}
        <Popover.Arrow className="fill-gray-900" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);