// src/pages/liquidity.tsx
import React from 'react';
import FeatureLanding from '../components/LandingPages/FeatureLanding';

const Liquidity = () => {
    return (
        <FeatureLanding
            title="Liquidity Across Solana"
            subtitle="Access all available liquidity pools on the Solana network"
            description="Powered by Jupiter API's, Swapfy aggregates liquidity from every available pool across the Solana network to find you the best possible swap rates. This intelligent routing system searches through multiple DEXs and liquidity pools to ensure optimal execution for your trades."
            features={[
                "Access to all major liquidity pools on Solana",
                "Smart order routing for best possible rates",
                "Cross-pool trading optimization",
                "Real-time price discovery across DEXs",
                "Custom pool creation coming soon",
                "User-defined liquidity pool fees in development"
            ]}
        />
    );
};

export default Liquidity;