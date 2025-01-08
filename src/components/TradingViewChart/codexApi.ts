// src/components/TradingViewChart/codexApi.ts

import axios from 'axios';

const CODEX_API_URL = process.env.NEXT_PUBLIC_CODEX_API_URL || 'https://graph.codex.io/graphql';
const CODEX_API_KEY = process.env.NEXT_PUBLIC_CODEX_API_KEY || '';
const SOLANA_NETWORK_ID = 1399811149;

// Constants for special addresses
const NATIVE_SOL = '11111111111111111111111111111111';
const WRAPPED_SOL = 'So11111111111111111111111111111111111111112';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

// Response interfaces
export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  buyers?: number;
  sells?: number;
  transactions?: number;
  buyVolume?: string;
  sellVolume?: string;
  volumeNativeToken?: string;
}

export interface PairMetadata {
  pairAddress: string;
  token0: string;
  token1: string;
  liquidity: string;
  price: string;
  volume24: string;
}

interface ListPairsResponse {
  results: Array<{
    pairAddress: string;
    token0: string;
    token1: string;
    liquidity: string;
  }>;
}

interface PairStats {
  liquidity: string;
  volume24h?: string;
  priceChange24h?: number;
}

// DetailedPairStats interface for extended data (future use)
interface DetailedPairStats {
  liquidity: string;
  volume: string;
  priceChange: number;
  bucketStats: {
    timestamp: number;
    volume: string;
    liquidity: string;
    priceChange: number;
  }[];
}

// Helper function to normalize token addresses
function normalizeTokenAddress(address: string): string {
  // Convert native SOL to Wrapped SOL
  if (address.toLowerCase() === NATIVE_SOL.toLowerCase()) {
    console.log('Converting native SOL to Wrapped SOL');
    return WRAPPED_SOL;
  }
  return address;
}

// Helper to determine if a token is a stablecoin
function isStablecoin(address: string): boolean {
  const normalizedAddress = address.toLowerCase();
  return [USDC.toLowerCase(), USDT.toLowerCase()].includes(normalizedAddress);
}

// Helper to validate price data
function isValidPriceData(bars: Bar[]): boolean {
  if (!bars.length) return false;
  
  return bars.every(bar => {
    const validPrice = 
      bar.close > 0 && 
      bar.open > 0 && 
      bar.high > 0 && 
      bar.low > 0 &&
      !isNaN(bar.close) &&
      isFinite(bar.close);
    const validVolume = bar.volume >= 0;
    const validTime = bar.time > 0;
    return validPrice && validVolume && validTime;
  });
}

// Helper to combine token/SOL pair with SOL/USD price
function combineWithSolPrice(tokenSolBars: Bar[], solUsdBars: Bar[]): Bar[] {
  return tokenSolBars.map(bar => {
    const solPrice = findClosestSolPrice(bar.time, solUsdBars);
    return {
      ...bar,
      open: bar.open * solPrice,
      high: bar.high * solPrice,
      low: bar.low * solPrice,
      close: bar.close * solPrice,
      volume: bar.volume * solPrice
    };
  });
}

// Helper to find closest SOL price for a given timestamp
function findClosestSolPrice(time: number, solBars: Bar[]): number {
  const closest = solBars.reduce((prev, curr) => {
    return Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev;
  }, solBars[0]);
  return closest.close;
}

// Fetch pair liquidity and other stats
export async function getPairLiquidity(pairAddress: string): Promise<PairStats> {
  try {
    console.log('Fetching detailed stats for pair:', pairAddress);
    const response = await axios.post(
      CODEX_API_URL,
      {
        query: `
          query($pairAddress: String!, $networkId: Int!) {
            getDetailedPairStats(
              pairAddress: $pairAddress
              networkId: $networkId
              duration: hour24
              bucketCount: 1
            ) {
              liquidity
              volume
              priceChange
              bucketStats {
                timestamp
                volume
                liquidity
                priceChange
              }
            }
          }
        `,
        variables: { 
          pairAddress,
          networkId: SOLANA_NETWORK_ID
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': CODEX_API_KEY
        }
      }
    );

    if (response.data.errors) {
      console.error('Codex API Error:', response.data.errors);
      // Return default values instead of throwing
      return {
        liquidity: '0',
        volume24h: '0',
        priceChange24h: 0
      };
    }

    const stats: DetailedPairStats = response.data.data.getDetailedPairStats;
    console.log('Received pair stats:', stats);

    // Transform the data to match our PairStats interface
    return {
      liquidity: stats.liquidity || '0',
      volume24h: stats.volume || '0',
      priceChange24h: stats.priceChange || 0
    };
  } catch (error) {
    console.error('Failed to fetch pair stats:', error);
    // Return default values instead of throwing
    return {
      liquidity: '0',
      volume24h: '0',
      priceChange24h: 0
    };
  }
}

// Fetch bars from Codex API
async function fetchBars({
  symbol,
  from,
  to,
  resolution,
  currencyCode = 'USD',
  removeEmptyBars = true,
}: {
  symbol: string;
  from: number;
  to: number;
  resolution: string;
  currencyCode?: 'USD' | 'TOKEN';
  removeEmptyBars?: boolean;
}): Promise<Bar[]> {
  console.log('Fetching bars from Codex API:', { symbol, from, to, resolution });

  try {
    const response = await axios.post(
      CODEX_API_URL,
      {
        query: `
          query($symbol: String!, $from: Int!, $to: Int!, $resolution: String!, $currencyCode: String, $removeEmptyBars: Boolean) {
            getBars(
              symbol: $symbol
              from: $from
              to: $to
              resolution: $resolution
              currencyCode: $currencyCode
              removeEmptyBars: $removeEmptyBars
            ) {
              t o h l c v s
              buyers sells transactions
              buyVolume sellVolume volume volumeNativeToken
            }
          }
        `,
        variables: {
          symbol,
          from,
          to,
          resolution,
          currencyCode,
          removeEmptyBars
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': CODEX_API_KEY
        }
      }
    );

    if (response.data.errors) {
      console.error('Codex API Error:', response.data.errors);
      return [];
    }

    const data = response.data.data?.getBars;
    if (!data || data.s !== 'ok') {
      console.log('No data returned for symbol:', symbol);
      return [];
    }

    return data.t.map((time: number, i: number) => ({
      time: time * 1000, // Convert to milliseconds for TradingView
      open: Number(data.o[i]),
      high: Number(data.h[i]),
      low: Number(data.l[i]),
      close: Number(data.c[i]),
      volume: Number(data.v[i]),
      buyers: data.buyers?.[i],
      sells: data.sells?.[i],
      transactions: data.transactions?.[i],
      buyVolume: data.buyVolume?.[i],
      sellVolume: data.sellVolume?.[i],
      volumeNativeToken: data.volumeNativeToken?.[i]
    }));

  } catch (error) {
    console.error('Error fetching from Codex API:', error);
    return [];
  }
}

// List pairs with metadata for a given token
export async function listPairsWithMetadataForToken({
  tokenAddress,
  networkId = SOLANA_NETWORK_ID,
  limit = 10
}: {
  tokenAddress: string;
  networkId?: number;
  limit?: number;
}): Promise<ListPairsResponse> {
  const normalizedAddress = normalizeTokenAddress(tokenAddress);
  
  console.log('Fetching pairs for normalized address:', normalizedAddress);

  try {
    const response = await axios.post(
      CODEX_API_URL,
      {
        query: `
          query($tokenAddress: String!, $networkId: Int!, $limit: Int) {
            listPairsWithMetadataForToken(
              tokenAddress: $tokenAddress
              networkId: $networkId
              limit: $limit
            ) {
              results {
                pairAddress
                token0
                token1
                liquidity
              }
            }
          }
        `,
        variables: {
          tokenAddress: normalizedAddress,
          networkId,
          limit
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': CODEX_API_KEY
        }
      }
    );

    if (response.data.errors) {
      console.error('Codex API Error:', response.data.errors);
      return { results: [] };
    }

    return response.data.data?.listPairsWithMetadataForToken || { results: [] };
  } catch (error) {
    console.error('Error fetching pair metadata:', error);
    return { results: [] };
  }
}

// Get bars with fallback logic
export interface PriceData {
  bars: Bar[];
  source: 'direct' | 'stablePair' | 'solPair' | null;
}

export async function getBarsWithFallback(
  fromMint: string,
  toMint: string,
  from: number,
  to: number,
  resolution: string
): Promise<PriceData> {
  console.log('Fetching price data for:', { fromMint, toMint });

  // Try direct USD price first
  const directSymbol = `${fromMint}:${SOLANA_NETWORK_ID}`;
  const directBars = await fetchBars({
    symbol: directSymbol,
    from,
    to,
    resolution
  });

  if (isValidPriceData(directBars)) {
    console.log('Found direct bars for token');
    return { bars: directBars, source: 'direct' };
  }

  // Try stablecoin pairs
  try {
    const pairs = await listPairsWithMetadataForToken({
      tokenAddress: fromMint
    });

    // Look for stablecoin pairs first
    const stablePair = pairs.results.find(pair => 
      isStablecoin(pair.token0) || isStablecoin(pair.token1)
    );
    
    if (stablePair) {
      const stableSymbol = `${stablePair.pairAddress}:${SOLANA_NETWORK_ID}`;
      const stableBars = await fetchBars({
        symbol: stableSymbol,
        from,
        to,
        resolution
      });

      if (isValidPriceData(stableBars)) {
        console.log('Found stablecoin pair, fetching bars');
        return { bars: stableBars, source: 'stablePair' };
      }
    }

    // Try SOL pair as last resort
    const solPair = pairs.results.find(pair => 
      [pair.token0.toLowerCase(), pair.token1.toLowerCase()].includes(WRAPPED_SOL.toLowerCase())
    );

    if (solPair) {
      // Get SOL price first
      const solSymbol = `${WRAPPED_SOL}:${SOLANA_NETWORK_ID}`;
      const solUsdBars = await fetchBars({
        symbol: solSymbol,
        from,
        to,
        resolution
      });

      // Get pair bars
      const pairSymbol = `${solPair.pairAddress}:${SOLANA_NETWORK_ID}`;
      const pairBars = await fetchBars({
        symbol: pairSymbol,
        from,
        to,
        resolution
      });

      if (isValidPriceData(solUsdBars) && isValidPriceData(pairBars)) {
        console.log('Found SOL pair, fetching and combining bars');
        // Multiply pair prices by SOL price to get USD estimate
        const adjustedBars = combineWithSolPrice(pairBars, solUsdBars);
        return { bars: adjustedBars, source: 'solPair' };
      }
    }
  } catch (error) {
    console.error('Error in fallback logic:', error);
  }

  console.log('No data found through any method');
  return { bars: [], source: null };
}

// Keep test connection function
export async function testCodexConnection(): Promise<boolean> {
  try {
    const response = await axios.post(
      CODEX_API_URL,
      {
        query: `{
          getNetworks {
            name
            id
          }
        }`
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': CODEX_API_KEY
        }
      }
    );

    return !response.data.errors;
  } catch (error) {
    console.error('Codex connection test failed:', error);
    return false;
  }
}