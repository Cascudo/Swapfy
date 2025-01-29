import React, { useCallback, useEffect, useState, useRef } from 'react';
import { DEFAULT_EXPLORER, FormProps } from 'src/types';
import { useUnifiedWalletContext, useWallet, useConnection } from '@jup-ag/wallet-adapter';
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
    const referralServiceRef = useRef<ReferralService | null>(null);
    const initializingRef = useRef<{[key: string]: boolean}>({});
    
    const passthroughWalletContextState = useWallet();
    const { setShowModal } = useUnifiedWalletContext();
    const wallet = useWallet();
    const { connection } = useConnection();

    // Initialize ReferralService once on mount
    useEffect(() => {
        referralServiceRef.current = new ReferralService(connection);
    }, [connection]);

    const handleReferralSetup = useCallback(async (toMint: string) => {
        if (!wallet.publicKey || !wallet.signTransaction || !referralServiceRef.current) {
            console.debug('Wallet not ready for referral setup');
            return;
        }

        // Prevent concurrent initialization attempts for the same mint
        if (initializingRef.current[toMint]) {
            console.debug('Already initializing referral for:', toMint);
            return;
        }

        try {
            initializingRef.current[toMint] = true;
            
            const referralKey = new PublicKey('6sBhr7PvQNizNDzin66r1WhznJXXqpGtpHct6ZamfHUe');
            const [feeAccount] = await PublicKey.findProgramAddressSync(
                [
                    Buffer.from('referral_ata'),
                    referralKey.toBuffer(),
                    new PublicKey(toMint).toBuffer(),
                ],
                new PublicKey('REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3')
            );

            // Check if account exists
            const accountInfo = await connection.getAccountInfo(feeAccount);
            if (accountInfo) {
                console.log('Referral token account already exists:', feeAccount.toString());
                return;
            }

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            
            const result = await referralServiceRef.current.initializeReferralTokenAccount(
                toMint,
                wallet.publicKey
            );

            if (result?.tx && wallet.signTransaction) {
                result.tx.recentBlockhash = blockhash;
                result.tx.feePayer = wallet.publicKey;
                
                const signed = await wallet.signTransaction(result.tx);
                
                const signature = await connection.sendRawTransaction(signed.serialize());
                await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                }, 'confirmed');
                
                console.log('Referral token account initialized:', signature);
            }
        } catch (error) {
            console.warn('Referral account setup warning:', error);
        } finally {
            initializingRef.current[toMint] = false;
        }
    }, [wallet, connection]);

    const handleTokenPairChange = useCallback(async (fromMint: string, toMint: string) => {
        if (!wallet.connected || !wallet.publicKey) {
            console.debug('Wallet not connected for token pair change');
            return;
        }

        console.log('Token pair changed:', {
            from: fromMint,
            to: toMint
        });

        if (currentPair?.from !== fromMint || currentPair?.to !== toMint) {
            setCurrentPair({
                from: fromMint,
                to: toMint
            });

            // Setup referral in the background
            handleReferralSetup(toMint).catch(console.error);

            if (onTokenPairChange) {
                onTokenPairChange(fromMint, toMint);
            }
        }
    }, [wallet, currentPair, handleReferralSetup, onTokenPairChange]);

    const launchTerminal = useCallback(async () => {
        if (!window.Jupiter || typeof window.Jupiter.init !== 'function') {
            console.error('Jupiter SDK not loaded');
            return;
        }

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
                if (form.fromMint && form.toMint) {
                    handleTokenPairChange(form.fromMint, form.toMint);
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
        handleTokenPairChange
    ]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined = undefined;
        if (!isLoaded || typeof window.Jupiter?.init !== 'function') {
            intervalId = setInterval(() => {
                if (window.Jupiter && typeof window.Jupiter.init === 'function') {
                    launchTerminal();
                    clearInterval(intervalId);
                }
            }, 500);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isLoaded, launchTerminal]);

    useEffect(() => {
        if (isLoaded && typeof window.Jupiter?.syncProps === 'function') {
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
                        className={`flex w-full max-w-[420px] justify-center bg-[#13111C] rounded-xl shadow-lg relative backdrop-blur-sm border border-white/10 hover:border-[#14F195]/50 transition-all duration-300 animate-fadeIn [&_button]:!text-white [&_*]:!text-opacity-100 ${!isLoaded ? 'visible' : ''}`}
                        style={{
                            minHeight: '600px',
                            height: 'auto',
                            background: '#13111C',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default IntegratedTerminal;