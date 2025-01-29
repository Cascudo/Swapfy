import { useConnection } from '@jup-ag/wallet-adapter';
import { AccountLayout, TOKEN_PROGRAM_ID, AccountInfo as TokenAccountInfo, u64 } from '@solana/spl-token';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BN from 'bn.js';
import React, { PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { WRAPPED_SOL_MINT } from 'src/constants';
import { fromLamports, getAssociatedTokenAddressSync } from 'src/misc/utils';
import { useWalletPassThrough } from './WalletPassthroughProvider';
import Decimal from 'decimal.js';

const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
const ACCOUNT_QUERY_KEY = 'accounts';
const SOL_QUERY_KEY = 'solBalance';

export interface IAccountsBalance {
  pubkey: PublicKey;
  balance: string;
  balanceLamports: BN;
  decimals: number;
  isFrozen: boolean;
}

interface IAccountContext {
  accounts: Record<string, IAccountsBalance>;
  nativeAccount: IAccountsBalance | null | undefined;
  loading: boolean;
  refresh: () => Promise<void>;
  lastSuccessfulFetch?: number;
}

interface ParsedTokenData {
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          owner: string;
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number;
            uiAmountString: string;
          };
          state: number;
        };
      };
    };
  };
  pubkey: PublicKey;
}

const AccountContext = React.createContext<IAccountContext>({
  accounts: {},
  nativeAccount: undefined,
  loading: true,
  refresh: async () => {},
});

type AccountsProviderProps = PropsWithChildren<{
  refetchIntervalForTokenAccounts?: number;
}>;

const AccountsProvider: React.FC<AccountsProviderProps> = ({
  children,
  refetchIntervalForTokenAccounts = 10_000,
}) => {
  const { publicKey, connected } = useWalletPassThrough();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const lastSuccessfulFetchRef = useRef<number>();
  const connectionErrorCount = useRef(0);
  const [isSolFetched, setIsSolFetched] = useState(false);

  // Fetch SOL balance first - it's fastest
  const fetchNative = useCallback(async () => {
    if (!publicKey || !connected) return null;

    try {
      const response = await connection.getAccountInfo(publicKey, 'confirmed');
      if (!response) return null;

      const nativeAccount = {
        pubkey: publicKey,
        balance: new Decimal(fromLamports(response?.lamports || 0, 9)).toString(),
        balanceLamports: new BN(response?.lamports || 0),
        decimals: 9,
        isFrozen: false,
      };

      setIsSolFetched(true);
      return nativeAccount;
    } catch (error) {
      console.error('[Accounts] Error fetching native account:', error);
      return null;
    }
  }, [publicKey, connected, connection]);

  // Helper to process token accounts
  const processTokenAccounts = (accounts: ParsedTokenData[]) => {
    return accounts.reduce((acc, item) => {
      const tokenAmount = item.account.data.parsed.info.tokenAmount;
      // Only include tokens with non-zero balance
      if (new BN(tokenAmount.amount).gt(new BN(0))) {
        acc[item.account.data.parsed.info.mint] = {
          balance: tokenAmount.uiAmountString,
          balanceLamports: new BN(tokenAmount.amount),
          pubkey: item.pubkey,
          decimals: tokenAmount.decimals,
          isFrozen: item.account.data.parsed.info.state === 2,
        };
      }
      return acc;
    }, {} as Record<string, IAccountsBalance>);
  };

  // Fetch token accounts progressively
  const fetchAllTokens = useCallback(async () => {
    if (!publicKey || !connected) return {};

    try {
      // Fetch standard token accounts first
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
        'confirmed'
      );

      let accounts = processTokenAccounts(tokenAccounts.value);
      
      // Update with initial token accounts
      queryClient.setQueryData(
        [ACCOUNT_QUERY_KEY, publicKey.toString()],
        (old: any) => ({
          ...old,
          accounts: { ...accounts },
        })
      );

      // Then fetch Token-2022 accounts
      try {
        const token2022Accounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_2022_PROGRAM_ID },
          'confirmed'
        );

        const token2022ProcessedAccounts = processTokenAccounts(token2022Accounts.value);
        accounts = { ...accounts, ...token2022ProcessedAccounts };
      } catch (error) {
        console.warn('[Accounts] Error fetching Token-2022 accounts:', error);
      }

      if (Object.keys(accounts).length > 0) {
        lastSuccessfulFetchRef.current = Date.now();
      }

      return accounts;
    } catch (error) {
      console.error('[Accounts] Error fetching token accounts:', error);
      
      // If we have recent successful data, return cached data
      const cachedData = queryClient.getQueryData([ACCOUNT_QUERY_KEY, publicKey.toString()]);
      if (cachedData && lastSuccessfulFetchRef.current && Date.now() - lastSuccessfulFetchRef.current < 30000) {
        return (cachedData as any).accounts || {};
      }
      return {};
    }
  }, [publicKey, connected, connection, queryClient]);

  // Separate query for SOL balance
  const { data: nativeAccount } = useQuery(
    [SOL_QUERY_KEY, publicKey?.toString()],
    fetchNative,
    {
      enabled: Boolean(publicKey?.toString() && connected),
      refetchInterval: refetchIntervalForTokenAccounts,
      staleTime: 5000,
      cacheTime: 30000,
    }
  );

  // Main query for token accounts
  const { data: tokenAccounts, isLoading, refetch } = useQuery(
    [ACCOUNT_QUERY_KEY, publicKey?.toString()],
    fetchAllTokens,
    {
      enabled: Boolean(publicKey?.toString() && connected && isSolFetched),
      refetchInterval: refetchIntervalForTokenAccounts,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 5000,
      cacheTime: 30000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
      onError: (error) => {
        console.error('[Accounts] Query error:', error);
      },
    }
  );

  // Reset error count when wallet changes
  useEffect(() => {
    connectionErrorCount.current = 0;
    setIsSolFetched(false);
  }, [publicKey, connected]);

  const refresh = useCallback(async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries([SOL_QUERY_KEY, publicKey?.toString()]),
        queryClient.invalidateQueries([ACCOUNT_QUERY_KEY, publicKey?.toString()]),
      ]);
    } catch (error) {
      console.error('[Accounts] Refresh error:', error);
    }
  }, [queryClient, publicKey]);

  const contextValue = {
    accounts: tokenAccounts || {},
    nativeAccount,
    loading: isLoading && !nativeAccount,
    refresh,
    lastSuccessfulFetch: lastSuccessfulFetchRef.current,
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

const useAccounts = () => {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccounts must be used within AccountsProvider');
  return context;
};

export { AccountsProvider, useAccounts };