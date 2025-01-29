// _app.tsx

import { UnifiedWalletButton, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { useConnection } from '@jup-ag/wallet-adapter';
import { useWallet } from '@solana/wallet-adapter-react';
import { JupiterProvider } from '@jup-ag/react-hook';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import classNames from 'classnames';

import 'tailwindcss/tailwind.css';
import '../styles/globals.css';

import AppHeader from 'src/components/AppHeader/AppHeader';
import Footer from 'src/components/Footer/Footer';
import CodeBlocks from 'src/components/CodeBlocks/CodeBlocks';
import FormConfigurator from 'src/components/FormConfigurator';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import V2SexyChameleonText from 'src/components/SexyChameleonText/V2SexyChameleonText';
import FeatureShowcaseButton from 'src/components/FeatureShowcaseButton';
import SwapfyIcon from 'src/icons/SwapfyIcon';

import { JUPITER_DEFAULT_RPC } from 'src/constants';
import { IInit } from 'src/types';
import { setTerminalInView } from 'src/stores/jotai-terminal-in-view';

import { TokenContextProvider } from 'src/contexts/TokenContextProvider';
import { SwapContextProvider } from 'src/contexts/SwapContext';
import { NetworkConfigurationProvider } from 'src/contexts/NetworkConfigurationProvider';
import WalletPassthroughProvider from 'src/contexts/WalletPassthroughProvider';

// Initialize QueryClient outside of the App component to prevent SSR issues
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

const isDevNodeENV = process.env.NODE_ENV === 'development';
const isDeveloping = isDevNodeENV && typeof window !== 'undefined';
const isPreview = Boolean(process.env.NEXT_PUBLIC_IS_NEXT_PREVIEW);

if ((isDeveloping || isPreview) && typeof window !== 'undefined') {
    (window as any).Jupiter = {};

    Promise.all([import('../library'), import('../index')]).then((res) => {
        const [libraryProps, rendererProps] = res;
        (window as any).Jupiter = libraryProps;
        (window as any).JupiterRenderer = rendererProps;
    });
}

export default function App({ Component, pageProps }: AppProps) {
    const [tab, setTab] = useState<IInit['displayMode']>('integrated');
    const [asLegacyTransaction, setAsLegacyTransaction] = useState(false);
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Jupiter && window.Jupiter._instance) {
            window.Jupiter._instance = null;
        }
        setTerminalInView(false);
    }, [tab]);

    const rpcUrl = useMemo(() => JUPITER_DEFAULT_RPC, []);
    const endpoint = useMemo(() => rpcUrl, [rpcUrl]);

    const watchAllFields = {
        simulateWalletPassthrough: true,
        refetchIntervalForTokenAccounts: 10000,
        formProps: {},
        strictTokenList: true,
        defaultExplorer: 'solscan',
        useUserSlippage: false,
    };

    const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

    const ShouldWrapWalletProvider = useMemo(() => {
        return watchAllFields.simulateWalletPassthrough
            ? ({ children }: { children: ReactNode }) => (
                <UnifiedWalletProvider
                    wallets={wallets}
                    config={{
                        env: 'mainnet-beta',
                        autoConnect: true,
                        metadata: {
                            name: 'SWAPFY Terminal',
                            description: '',
                            url: 'https://swapfy.fun',
                            iconUrls: ['/swapfy-logo.svg'],
                        },
                        theme: 'jupiter',
                    }}
                >
                    {children}
                </UnifiedWalletProvider>
            )
            : React.Fragment;
    }, [wallets, watchAllFields.simulateWalletPassthrough]);

    // Provide defaults for SwapContextProvider
    const displayMode: IInit['displayMode'] = 'integrated';
    const scriptDomain: IInit['scriptDomain'] = 'localhost';
    const formProps = watchAllFields.formProps;

    return (
        <QueryClientProvider client={queryClient}>
            <DefaultSeo
                title={'SWAPFY Decentralized Exchange'}
                openGraph={{
                    type: 'website',
                    locale: 'en',
                    title: 'SWAPFY Decentralized Exchange',
                    description:
                        'SWAPFY Decentralized Exchange: An open-sourced, DEX liquidity pool aggregator that provides end-to-end swap flow.',
                    url: 'https://swapfy.fun',
                    site_name: 'SWAPFY Decentralized Solana Exchange',
                    images: [
                        {
                            url: `https://swapfy.fun/swapfy-logo.svg`,
                            alt: 'SWAPFY Decentralized Solana Exchange',
                        },
                    ],
                }}
                twitter={{
                    cardType: '/swapfy-fast-trading-terminal.png',
                    site: 'Swapfy',
                    handle: '@swapfydotfun',
                }}
            />
            <ConnectionProvider endpoint={endpoint}>
                <UnifiedWalletProvider
                    wallets={wallets}
                    config={{
                        env: 'mainnet-beta',
                        autoConnect: true,
                        metadata: {
                            name: 'SWAPFY Terminal',
                            description: '',
                            url: 'https://swapfy.fun',
                            iconUrls: ['/swapfy-logo.svg'],
                        },
                        theme: 'jupiter',
                    }}
                >
                    <NetworkConfigurationProvider localStoragePrefix="swapfy">
                        <WalletPassthroughProvider>
                            <JupiterProvider
                                connection={connection}
                                userPublicKey={publicKey || undefined}
                                routeCacheDuration={300000} // 5 minutes in ms
                                wrapUnwrapSOL={true}
                            >
                                <TokenContextProvider formProps={formProps}>
                                    <SwapContextProvider
                                        displayMode={displayMode}
                                        scriptDomain={scriptDomain}
                                        asLegacyTransaction={asLegacyTransaction}
                                        setAsLegacyTransaction={setAsLegacyTransaction}
                                        formProps={formProps}
                                    >
                                        <div className="bg-v3-bg min-h-screen w-screen max-w-screen overflow-x-hidden flex flex-col justify-between">
                                            <div>
                                                <AppHeader />
                                                <Component
                                                    {...pageProps}
                                                    rpcUrl={rpcUrl}
                                                    watchAllFields={watchAllFields}
                                                    ShouldWrapWalletProvider={ShouldWrapWalletProvider}
                                                />
                                            </div>
                                            <div className="w-full mt-auto">
                                                <Footer />
                                            </div>
                                        </div>
                                    </SwapContextProvider>
                                </TokenContextProvider>
                            </JupiterProvider>
                        </WalletPassthroughProvider>
                    </NetworkConfigurationProvider>
                </UnifiedWalletProvider>
            </ConnectionProvider>
        </QueryClientProvider>
    );
}
