import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDebounce, useLocalStorage } from 'react-use';
import { splitIntoChunks } from 'src/misc/utils';
import { useAccounts } from './accounts';
import { useSwapContext } from './SwapContext';
import { useTokenContext } from './TokenContextProvider';
import { IInit } from 'src/types';

const MAXIMUM_PARAM_SUPPORT = 100;
const CACHE_EXPIRE_TIME = 1000 * 60 * 1; // 1 min

interface CacheUSDValue {
  usd: number;
  timestamp: number;
}

export interface ITokenUSDValue {
  [key: string]: CacheUSDValue | undefined;
}

export interface USDValueState {
  tokenPriceMap: ITokenUSDValue;
  getUSDValue: (cgId: string | string[]) => void;
}

export const USDValueProviderContext = createContext<USDValueState>({} as USDValueState);

export function useUSDValueProvider(): USDValueState {
  return useContext(USDValueProviderContext);
}

interface JupPriceResponse {
  [id: string]: { id: string; mintSymbol: string; vsToken: string; vsTokenSymbol: string; price: number };
}

const hasExpired = (timestamp: number) => {
  return new Date().getTime() - timestamp >= CACHE_EXPIRE_TIME;
};

export const USDValueProvider: FC<PropsWithChildren<IInit>> = ({ children }) => {
  const { accounts } = useAccounts();
  const { getTokenInfo } = useTokenContext();
  const { fromTokenInfo, toTokenInfo } = useSwapContext();

  const [cachedPrices, setCachedPrices] = useLocalStorage<ITokenUSDValue>(`${window.Jupiter.localStoragePrefix}-cached-token-prices`, {});
  const [addresses, setAddresses] = useState<Set<string>>(new Set());
  const [debouncedAddresses, setDebouncedAddresses] = useState<string[]>([]);

  useDebounce(
    () => {
      setDebouncedAddresses(Array.from(addresses));
    },
    250,
    [addresses],
  );

  /**
   * Fetches token prices from the Jupiter API with error handling and timeout.
   * @param addresses Array of token addresses to fetch prices for.
   * @returns An object containing successful results and failed addresses.
   */
  const getPriceFromJupAPI = useCallback(async (addresses: string[]) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(
        `https://api.jup.ag/price/v2?ids=${addresses.join(',')}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data }: { data: JupPriceResponse } = await response.json();
      const nowTimestamp = new Date().getTime();

      const result = addresses.reduce<{ result: Record<string, CacheUSDValue>; failed: string[] }>(
        (accValue, address) => {
          const priceForAddress = data[address];
          if (!priceForAddress) {
            return {
              ...accValue,
              failed: [...accValue.failed, address],
            };
          }

          return {
            ...accValue,
            result: {
              ...accValue.result,
              [priceForAddress.id]: {
                usd: priceForAddress.price,
                timestamp: nowTimestamp,
              },
            },
          };
        },
        { result: {}, failed: [] },
      );

      return result;
    } catch (error) {
      // Return empty result and mark all addresses as failed
      console.error('Price fetch error:', error);
      return { result: {}, failed: addresses };
    }
  }, []);

  /**
   * Custom hook to fetch token USD values using React Query.
   * Incorporates error handling, retries, and caching mechanisms.
   */
  const { data: tokenPriceMap, isFetched: isLatest } = useQuery<ITokenUSDValue>(
    [debouncedAddresses, Object.keys(cachedPrices || {}).length],
    async () => {
      let results: ITokenUSDValue = {};
      const tokenAddressToFetch: string[] = [];

      // Determine which addresses need to be fetched
      debouncedAddresses.forEach((address) => {
        if (!address) return;

        const cachePrice = (cachedPrices || {})[address];
        if (!cachePrice || hasExpired(cachePrice.timestamp)) {
          tokenAddressToFetch.push(address);
        } else {
          results[address] = {
            usd: cachePrice.usd,
            timestamp: cachePrice.timestamp,
          };
        }
      });

      if (!tokenAddressToFetch.length) return results;

      try {
        // Split addresses into manageable chunks
        const fetchFromJup = splitIntoChunks(tokenAddressToFetch, MAXIMUM_PARAM_SUPPORT);

        // Fetch prices from Jupiter API
        const allResults = await Promise.all(
          fetchFromJup.map((batch) => getPriceFromJupAPI(batch))
        );

        // Merge all successful results
        allResults.forEach(({ result }) => {
          results = {
            ...results,
            ...result,
          };
        });

        // Cache the newly fetched prices
        setCachedPrices((prev) => ({
          ...prev,
          ...results,
        }));

        // Optionally, handle failed addresses (e.g., retry or log)
        const failedAddresses = allResults.flatMap(({ failed }) => failed);
        if (failedAddresses.length) {
          console.warn('Failed to fetch prices for addresses:', failedAddresses);
          // You can implement additional retry logic here if desired
        }

        return results;
      } catch (error) {
        console.error('Failed to fetch prices:', error);
        // Return cached results on error
        return results;
      }
    },
    {
      enabled: debouncedAddresses.length > 0,
      staleTime: 10_000, // 10 seconds
      refetchInterval: CACHE_EXPIRE_TIME,
      refetchIntervalInBackground: true, // Enable background refresh
      retry: 2, // Retry twice on failure
      retryDelay: 1000, // Wait 1 second between retries
      onError: (error) => {
        console.error('Price query error:', error);
      },
    },
  );

  /**
   * Clears expired cache entries on initial load.
   */
  useEffect(() => {
  setCachedPrices((prevState: ITokenUSDValue = {}) => {
    return Object.entries(prevState)
      .filter(([_, usdCacheValue]) => !hasExpired(usdCacheValue?.timestamp ?? 0))
      .reduce<ITokenUSDValue>((accValue, [mint, usdCacheValue]) => ({
        ...accValue,
        [mint]: usdCacheValue,
      }), {});
  });
}, [setCachedPrices]);

  /**
   * Ensures that the 'from' and 'to' tokens have their addresses tracked for USD value fetching.
   */
  useEffect(() => {
    setAddresses((prev) => {
      const newSet = new Set([...prev]);
      if (fromTokenInfo?.address) newSet.add(fromTokenInfo.address);
      if (toTokenInfo?.address) newSet.add(toTokenInfo.address);
      return newSet;
    });
  }, [fromTokenInfo, toTokenInfo]);

  /**
   * Merges cached prices with the latest fetched prices to create a comprehensive price map.
   */
  const priceMap = useMemo(() => {
    return {
      ...cachedPrices,
      ...tokenPriceMap,
    };
  }, [tokenPriceMap, cachedPrices]);

  /**
   * Adds token addresses to the tracking set for USD value fetching.
   * @param tokenAddresses Single or array of token addresses.
   */
  const getUSDValue = useCallback((tokenAddresses: string | string[]) => {
    setAddresses((prev) => {
      const newTokenAddresses = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];
      return new Set([...prev, ...newTokenAddresses]);
    });
  }, []);

  /**
   * Tracks user account addresses and ensures their USD values are fetched and cached.
   */
  useEffect(() => {
    if (!Object.keys(accounts).length) return;

    const userAccountAddresses: string[] = Object.keys(accounts)
      .map((key) => {
        const token = getTokenInfo(key);
        return token?.address;
      })
      .filter(Boolean) as string[];

    // Fetch USD value for user account tokens
    getUSDValue(userAccountAddresses);

    setAddresses((prev) => new Set([...prev, ...userAccountAddresses]));
  }, [accounts, getTokenInfo, getUSDValue]);

  return (
    <USDValueProviderContext.Provider value={{ tokenPriceMap: priceMap, getUSDValue }}>
      {children}
    </USDValueProviderContext.Provider>
  );
};

/**
 * Custom hook to access the USDValue context.
 * @returns USDValueState containing token price map and a method to fetch USD values.
 */
export function useUSDValue() {
  const context = useContext(USDValueProviderContext);
  if (!context) {
    throw new Error('useUSDValue must be used within a USDValueProvider');
  }
  return context;
}
