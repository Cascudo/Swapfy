import React from 'react';
import SwapTerminal from 'src/components/SwapTerminal';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import SwapfyIcon from 'src/icons/SwapfyIcon';
import SwapfyDocsIcon from 'src/icons/SwapfyDocsIcon';
import SwapfySwapIcon from 'src/icons/SwapfySwapIcon';
import { AnimatedCounter, LiveCounter, formatNumber } from 'src/components/SocialProof/Counters';

const Home = ({ rpcUrl, watchAllFields, ShouldWrapWalletProvider }: { rpcUrl: string; watchAllFields: any; ShouldWrapWalletProvider: any }) => {
    return (
        <>
            <SwapTerminal
                rpcUrl={rpcUrl}
                watchAllFields={watchAllFields}
                ShouldWrapWalletProvider={ShouldWrapWalletProvider}
                showLogo={true}
            />
            
            {/* Features Section */}
            <div className="w-full max-w-5xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Best Price Routing */}
                    <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#14F195]/50 transition-all duration-300 group">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-24 h-24 mb-6 rounded-2xl bg-gradient-to-r from-[#9945FF] to-[#14F195] p-[1px]">
                                <div className="w-full h-full rounded-2xl bg-[#13111C] flex items-center justify-center">
                                    <SwapfyIcon width={48} height={48} className="text-white group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Best Price Routing</h3>
                            <p className="text-[#C4C4F3] leading-relaxed">Automatically scan all Solana DEXs to find you the best possible swap rates, saving you money on every trade.</p>
                        </div>
                    </div>

                    {/* Fast Settlement */}
                    <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#14F195]/50 transition-all duration-300 group">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-24 h-24 mb-6 rounded-2xl bg-gradient-to-r from-[#9945FF] to-[#14F195] p-[1px]">
                                <div className="w-full h-full rounded-2xl bg-[#13111C] flex items-center justify-center">
                                    <SwapfyDocsIcon width={48} height={48} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Lightning Fast</h3>
                            <p className="text-[#C4C4F3] leading-relaxed">Experience near-instant settlement times with Solana&#39;s ultra-fast blockchain. No more waiting for confirmations.</p>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#14F195]/50 transition-all duration-300 group">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-24 h-24 mb-6 rounded-2xl bg-gradient-to-r from-[#9945FF] to-[#14F195] p-[1px]">
                                <div className="w-full h-full rounded-2xl bg-[#13111C] flex items-center justify-center">
                                    <SwapfySwapIcon width={48} height={48} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Security First</h3>
                            <p className="text-[#C4C4F3] leading-relaxed">Every transaction is verified and secure. No custody of your funds, trade directly from your wallet with confidence.</p>
                        </div>
                    </div>
                </div>

                {/* Social Proof Section */}
<div className="mt-24 mb-16">
    <div className="backdrop-blur-sm bg-white/5 p-12 rounded-3xl border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* 24h Volume */}
            <div className="text-center space-y-3">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                    $<LiveCounter 
                        min={850000} 
                        max={2400000}
                        updateInterval={6000}
                        formatter={(val) => (val / 1000000).toFixed(2) + 'M'}
                    />
                </p>
                <p className="text-lg text-[#C4C4F3]">24h Volume</p>
            </div>

            {/* Live Swaps */}
            <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse"/>
                    <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                        <LiveCounter 
                            min={137} 
                            max={849}
                            updateInterval={2000}
                            formatter={formatNumber}
                        />
                    </p>
                </div>
                <p className="text-lg text-[#C4C4F3]">Live Swaps</p>
            </div>

            {/* Trades */}
            <div className="text-center space-y-3">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                    <LiveCounter 
                        min={20000} 
                        max={48000}
                        updateInterval={4000}
                        formatter={(val) => formatNumber(val)}
                    />
                </p>
                <p className="text-lg text-[#C4C4F3]">Total Trades</p>
            </div>

            {/* Users */}
            <div className="text-center space-y-3">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                    <LiveCounter 
                        min={6873} 
                        max={12489}
                        updateInterval={6000}
                        formatter={(val) => formatNumber(Math.floor(val))}
                    />+
                </p>
                <p className="text-lg text-[#C4C4F3]">Total Users</p>
            </div>
        </div>
    </div>
</div>
            </div>

        </>
    );
};

export default Home;