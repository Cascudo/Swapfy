// src/pages/swap.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TradingViewChart from 'src/components/TradingViewChart';
import { useSwapContext } from 'src/contexts/SwapContext';
import { DEFAULT_EXPLORER } from 'src/types';
import { listPairsWithMetadataForToken } from 'src/components/TradingViewChart/codexApi';
import SwapTerminal from 'src/components/SwapTerminal';
import cn from 'classnames';

interface SwapPageProps {
  rpcUrl: string;
  watchAllFields: {
    refetchIntervalForTokenAccounts: number;
    formProps: any;
    simulateWalletPassthrough: boolean;
    strictTokenList: boolean;
    defaultExplorer: DEFAULT_EXPLORER;
    useUserSlippage: boolean;
  };
  ShouldWrapWalletProvider: React.ComponentType<{ children: React.ReactNode }>;
}

interface PairTestState {
  status: 'idle' | 'searching' | 'found' | 'error';
  currentAttempt: 'direct' | 'usdc' | 'sol' | null;
  pairAddress: string | null;
  error: string | null;
  liquidity?: string;
}

interface InfoSectionProps {
  title: string;
  className?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, className }) => (
  <div className={cn("bg-[#13111C] rounded-xl p-4 shadow-lg", className)}>
    <h2 className="text-[#14F195] text-lg font-medium mb-2">{title}</h2>
    <div className="text-gray-400 text-sm">Loading...</div>
  </div>
);

const SwapPage: React.FC<SwapPageProps> = ({
  rpcUrl,
  watchAllFields,
  ShouldWrapWalletProvider,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { form, fromTokenInfo, toTokenInfo } = useSwapContext();
  const { fromMint } = form;

  const [selectedPair, setSelectedPair] = useState<{ fromMint: string; toMint: string } | null>(null);
  
  const [pairTestState, setPairTestState] = useState<PairTestState>({
    status: 'idle',
    currentAttempt: null,
    pairAddress: null,
    error: null,
  });

  const discoverPair = useCallback(async (fromAddress: string, toAddress: string) => {
    if (!fromAddress || !toAddress) return;
    
    console.log('🔍 Discovering pair:', { fromAddress, toAddress });
    
    setPairTestState(prev => ({
      ...prev,
      status: 'searching',
      currentAttempt: 'direct',
      error: null
    }));

    try {
      const pairs = await listPairsWithMetadataForToken({
        limit: 10,
        networkId: 1399811149,
        tokenAddress: fromAddress,
      });

      const directPair = pairs.results.find(
        pair => pair.token0?.toLowerCase() === toAddress.toLowerCase() ||
                pair.token1?.toLowerCase() === toAddress.toLowerCase()
      );

      if (directPair) {
        setPairTestState({
          status: 'found',
          currentAttempt: 'direct',
          pairAddress: directPair.pairAddress,
          liquidity: directPair.liquidity,
          error: null
        });
        return;
      }

      setPairTestState({
        status: 'error',
        currentAttempt: null,
        pairAddress: null,
        error: 'No valid pairs found for these tokens',
        liquidity: '0'
      });
    } catch (error) {
      console.error('⚠️ Error discovering pair:', error);
      setPairTestState(prev => ({
        ...prev,
        status: 'error',
        currentAttempt: null,
        pairAddress: null,
        error: error instanceof Error ? error.message : 'Failed to fetch pair data',
        liquidity: '0'
      }));
    }
  }, []);

  const handleTokenPairChange = useCallback(async (fromMint: string, toMint: string) => {
    console.log('🔄 Token pair changed:', {
      fromMint,
      toMint,
      fromSymbol: fromTokenInfo?.symbol,
      toSymbol: toTokenInfo?.symbol,
    });

    setSelectedPair({ fromMint, toMint });
    discoverPair(fromMint, toMint);
    
  }, [discoverPair, fromTokenInfo?.symbol, toTokenInfo?.symbol]);

  useEffect(() => {
    if (form.fromMint && form.toMint) {
      const timeoutId = setTimeout(() => {
        handleTokenPairChange(form.fromMint, form.toMint);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [form.fromMint, form.toMint, handleTokenPairChange]);

  useEffect(() => {
    setIsMounted(true);
    const checkDeviceType = () => {
      setIsDesktop(window.matchMedia('(min-width: 768px)').matches);
    };
    checkDeviceType();
    
    const resizeHandler = () => {
      requestAnimationFrame(checkDeviceType);
    };
    
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-[1800px] mx-auto">
        <div className="lg:w-2/3 h-[600px] bg-[#13111C] rounded-xl shadow-lg p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14F195]"></div>
        </div>
        <div className="lg:w-1/3 bg-[#13111C] rounded-xl shadow-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[1980px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-3/4 min-h-[600px] bg-[#13111C] rounded-xl shadow-lg p-4">
          {fromMint ? (
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <TradingViewChart
                  key={`${selectedPair?.fromMint}-${selectedPair?.toMint}-${pairTestState.pairAddress || 'no-pair'}`}
                  fromMint={selectedPair?.fromMint || ''}
                  toMint={selectedPair?.toMint || ''}
                  className="h-full"
                  pairAddress={pairTestState.pairAddress || ''}
                  fromTokenInfo={fromTokenInfo || undefined}
                  toTokenInfo={toTokenInfo || undefined}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white space-y-4 p-4">
              <p className="text-lg font-semibold">Welcome to Swapfy Charts</p>
              <p className="text-sm text-white/60 text-center">
                Please select a token pair using the terminal to view trading data.
              </p>
            </div>
          )}
        </div>

        <div className="lg:w-1/4">
          <div className="rounded-xl bg-[#13111C]">
            <SwapTerminal
              rpcUrl={rpcUrl}
              watchAllFields={{
                ...watchAllFields,
                refetchIntervalForTokenAccounts: 10000,
              }}
              ShouldWrapWalletProvider={ShouldWrapWalletProvider}
              showLogo={false}
              onTokenPairChange={(fromMint, toMint) => {
                if (fromMint && toMint) {
                  handleTokenPairChange(fromMint, toMint);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-16">
        <InfoSection title="DEX PAID CHECK" className="lg:col-span-1" />
        <InfoSection title="LATEST MINTED TOKENS" className="lg:col-span-1" />
        <InfoSection title="RECENTLY BONDED TOKENS" className="lg:col-span-1" />
      </div>
    </div>
  );
};

export default SwapPage;