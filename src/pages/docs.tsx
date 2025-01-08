// src/pages/docs.tsx
import React from 'react';
import FeatureLanding from '../components/LandingPages/FeatureLanding';
import Head from 'next/head';

const Docs = () => {
    return (
        <>
            <Head>
                <title>How to Swap Crypto - Swapfy Docs</title>
                <meta name="description" content="Step-by-step guide on how to make cryptocurrency swaps on the Swapfy platform." />
                <meta name="keywords" content="crypto swap, cryptocurrency exchange, decentralized finance, DeFi, Swapfy" />
            </Head>
            <div className="relative before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-b before:from-[#4A90E2] before:to-[#46E387] before:opacity-10 before:z-[-1]">
                <FeatureLanding
                    title="How to Swap Crypto"
                    subtitle="A step-by-step guide to making trades on Swapfy"
                    description="Swapfy makes it easy to exchange one cryptocurrency for another. Follow these simple instructions to start trading on our platform."
                    features={[
                        "Connect your wallet to Swapfy",
                        "Select the token pair you want to swap",
                        "Enter the amount you want to trade",
                        "Review the transaction details",
                        "Confirm the swap and wait for it to be processed",
                        "View your updated balances in your wallet"
                    ]}
                />
            </div>
        </>
    );
};

export default Docs;