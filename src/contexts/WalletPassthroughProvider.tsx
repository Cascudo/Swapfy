import { SendTransactionOptions, useWallet, Wallet, WalletContextState, WalletName } from '@jup-ag/wallet-adapter';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { useAtom } from 'jotai';
import React, { createContext, FC, PropsWithChildren, ReactNode, useContext, useMemo, useEffect, useState } from 'react';
import { appProps } from 'src/library';

const initialPassThrough: WalletContextState = {
  publicKey: null,
  wallets: [],
  wallet: null,
  connect: async () => {},
  select: () => {},
  connecting: false,
  connected: false,
  disconnect: async () => {},
  autoConnect: false,
  disconnecting: false,
  sendTransaction: async (transaction: Transaction | VersionedTransaction, connection: Connection, options?: SendTransactionOptions) => '',
  signTransaction: undefined,
  signAllTransactions: undefined,
  signMessage: undefined,
  signIn: undefined,
};

export const WalletPassthroughContext = createContext<WalletContextState>(initialPassThrough);

export function useWalletPassThrough(): WalletContextState {
  return useContext(WalletPassthroughContext);
}

const FromWalletAdapter: FC<PropsWithChildren> = ({ children }) => {
  const walletContextState = useWallet();
  return <WalletPassthroughContext.Provider value={walletContextState}>{children}</WalletPassthroughContext.Provider>;
};

const WalletPassthroughProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [atom] = useAtom(appProps);
  const wallet = atom?.passthroughWalletContextState?.wallet;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const walletPassthrough: WalletContextState = useMemo(() => {
    return {
      ...initialPassThrough,
      ...atom?.passthroughWalletContextState,
      disconnect: async () => {
        try {
          if (wallet?.adapter?.disconnect) {
            return wallet?.adapter?.disconnect();
          }
        } catch (error) {
          console.log(error);
        }
      },
    };
  }, [atom?.passthroughWalletContextState, wallet?.adapter]);

  // Only run client-side code after mounting
  if (!isClient) {
    return <WalletPassthroughContext.Provider value={initialPassThrough}>{children}</WalletPassthroughContext.Provider>;
  }

  // Now safe to check window object
  if (typeof window !== 'undefined' && !window.Jupiter?.enableWalletPassthrough) {
    return <FromWalletAdapter>{children}</FromWalletAdapter>;
  }

  if (walletPassthrough) {
    return <WalletPassthroughContext.Provider value={walletPassthrough}>{children}</WalletPassthroughContext.Provider>;
  }

  return <>{children}</>;
};

export default WalletPassthroughProvider;