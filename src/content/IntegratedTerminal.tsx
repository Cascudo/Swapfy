import React, { useCallback, useEffect, useState } from 'react';
import { DEFAULT_EXPLORER, FormProps } from 'src/types';
import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import { Connection, PublicKey } from '@solana/web3.js';
import { ReferralService } from '../components/Referral/ReferralService';

const IntegratedTerminal = (props: {
    rpcUrl: string;
    refetchIntervalForTokenAccounts?: number;
    formProps: FormProps;
    simulateWalletPassthrough: boolean;
    strictTokenList: boolean;
    defaultExplorer: DEFAULT_EXPLORER;
    useUserSlippage: boolean;
    onTokenPairChange?: (from: string, to: string) => void;
}) => {
    const {
        rpcUrl,
        formProps,
        simulateWalletPassthrough,
        strictTokenList,
        defaultExplorer,
        useUserSlippage,
        refetchIntervalForTokenAccounts,
        onTokenPairChange,
    } = props;

    const [isLoaded, setIsLoaded] = useState(false);
    const [currentPair, setCurrentPair] = useState<{from: string, to: string} | null>(null);

    const passthroughWalletContextState = useWallet();
    const { setShowModal } = useUnifiedWalletContext();

    const [referralService, setReferralService] = useState<ReferralService | null>(null);
    const wallet = useWallet();

    useEffect(() => {
        const connection = new Connection(rpcUrl);
        setReferralService(new ReferralService(connection));
    }, [rpcUrl]);

    const launchTerminal = useCallback(async () => {
        if (!window.Jupiter || typeof window.Jupiter.init !== 'function') {
            console.error('Jupiter SDK not loaded');
            return;
        }

        const handleTokenPairChange = async (fromMint: string, toMint: string) => {
            if (!referralService || !wallet.publicKey) return;
        
            try {
                const connection = new Connection(rpcUrl);
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
                
                const result = await referralService.initializeReferralTokenAccount(toMint, wallet.publicKey);
                if (result?.tx && wallet.signTransaction) {
                    result.tx.recentBlockhash = blockhash;
                    const signed = await wallet.signTransaction(result.tx);
                    
                    try {
                        const signature = await connection.sendRawTransaction(signed.serialize());
                        await connection.confirmTransaction({
                            signature,
                            blockhash,
                            lastValidBlockHeight
                        });
                        console.log('Referral token account transaction confirmed:', signature);
                    } catch (sendError) {
                        console.error('Failed to send/confirm transaction:', sendError);
                    }
                }
            } catch (error) {
                console.error('RPC or transaction error:', error);
            }
        };

        window.Jupiter.init({
            displayMode: 'integrated',
            integratedTargetId: 'integrated-terminal',
            endpoint: rpcUrl,
            refetchIntervalForTokenAccounts,
            formProps,
            enableWalletPassthrough: simulateWalletPassthrough,
            passthroughWalletContextState: simulateWalletPassthrough ? passthroughWalletContextState : undefined,
            onRequestConnectWallet: () => setShowModal(true),
            strictTokenList,
            defaultExplorer,
            useUserSlippage,
            platformFeeAndAccounts: {
                referralAccount: new PublicKey('6sBhr7PvQNizNDzin66r1WhznJXXqpGtpHct6ZamfHUe'),
                feeBps: 35,
            },
            onFormUpdate: (form) => {
                if (
                    form.fromMint && 
                    form.toMint && 
                    (!currentPair || 
                     currentPair.from !== form.fromMint || 
                     currentPair.to !== form.toMint)
                ) {
                    handleTokenPairChange(form.fromMint, form.toMint);
                    console.log('Token pair changed:', {
                        from: form.fromMint,
                        to: form.toMint
                    });
                    
                    setCurrentPair({
                        from: form.fromMint,
                        to: form.toMint
                    });

                    if (onTokenPairChange) {
                        onTokenPairChange(form.fromMint, form.toMint);
                    }
                }
            }
        });

        setIsLoaded(true);
    }, [
        rpcUrl,
        refetchIntervalForTokenAccounts,
        formProps,
        simulateWalletPassthrough,
        passthroughWalletContextState,
        strictTokenList,
        defaultExplorer,
        useUserSlippage,
        setShowModal,
        currentPair,
        onTokenPairChange,
        wallet,
        referralService
    ]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined = undefined;
        if (!isLoaded || typeof window.Jupiter.init !== 'function') {
            intervalId = setInterval(() => {
                if (window.Jupiter && typeof window.Jupiter.init === 'function') {
                    launchTerminal();
                    clearInterval(intervalId!);
                }
            }, 500);
        }

        if (intervalId) {
            return () => clearInterval(intervalId);
        }
    }, [isLoaded, launchTerminal]);

    useEffect(() => {
        if (isLoaded && typeof window.Jupiter.syncProps === 'function') {
            window.Jupiter.syncProps({ passthroughWalletContextState });
        }
    }, [passthroughWalletContextState, isLoaded]);

    return (
        <div className="min-h-[auto] h-[auto] w-full rounded-2xl text-white flex flex-col items-center p-2 lg:p-4 mb-4 overflow-hidden mt-2">
            <div className="flex flex-col lg:flex-row h-full w-full overflow-auto">
                <div className="w-full h-full rounded-xl overflow-hidden flex justify-center">
                    {!isLoaded ? (
                        <div className="h-full w-full animate-pulse bg-[#4A90E2]/10 mt-2 lg:mt-0 lg:ml-4 flex items-center justify-center rounded-xl">
                            <p className="text-[#4A90E2] font-semibold">Loading...</p>
                        </div>
                    ) : null}
                    <div
                        id="integrated-terminal"
                        className={`flex w-full max-w-[420px] justify-center bg-[#13111C] rounded-xl shadow-lg relative backdrop-blur-sm border border-white/10 hover:border-[#14F195]/50 transition-all duration-300 animate-fadeIn ${!isLoaded ? 'visible' : ''}`}
                        style={{
                            minHeight: '600px',
                            height: 'auto',
                            background: '#13111C',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default IntegratedTerminal;