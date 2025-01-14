import React from 'react';

interface RoadmapPhase {
    title: string;
    timeline: string;
    features: string[];
    status: 'upcoming' | 'in-progress' | 'completed';
}

const Roadmap = () => {
    const phases: RoadmapPhase[] = [
        {
            title: "Phase 1: Foundation",
            timeline: "Dec/24",
            features: [
                "Soft launch of the platform - DONE",
                "Fair Launch Platform Token - DONE CA: 6vW6kVZ5hGu9id9bdBd3dpJ7JkYbmWMBHmgXaPepump",
                "Lock Dev Wallet 2.5 Years - DONE - https://tools.smithii.io/token-vesting-certificate/SWAPFY-LOCKED",
                "Start Community Rewards - Ongoing"
            ],
            status: 'in-progress'
        },
        {
            title: "Phase 2: Core DEX",
            timeline: "Q1/25",
            features: [
                "Continuous Community Growth",
                "Add Token Creation Feature",
                "Add Automated Market Maker (AMM)",
                "Add Concentrated Liquidity Market Maker (CLMM)"
            ],
            status: 'upcoming'
        },
        {
            title: "Phase 3: Advanced Features",
            timeline: "Q2/25",
            features: [
                "Add EVM Chains",
                "Continuous Community Growth",
                "Implement Limit Order functionality",
                "Add Dollar Cost Averaging (DCA)"
            ],
            status: 'upcoming'
        },
        {
            title: "Phase 4: Optimization",
            timeline: "Q4/25",
            features: [
                "Continuous Community Growth",
                "Add Sustainability Features",
                "Add AGI Trading Bots",
                "Add Perpetuals",
                "Add Options"
            ],
            status: 'upcoming'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#13111C] to-[#170F2D] relative overflow-hidden">
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#9945FF] opacity-10 blur-[150px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#14F195] opacity-10 blur-[150px] translate-x-1/2" />

            <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16 md:mb-24">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#14F195] bg-clip-text text-transparent animate-float inline-block">
                        Roadmap
                    </h1>
                    <p className="text-xl text-[#C4C4F3] animate-fadeIn">
                        Building the future of Solana DeFi
                    </p>
                </div>

                {/* Timeline */}
                <div className="max-w-4xl mx-auto relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#9945FF] via-[#14F195] to-[#170F2D]" />

                    {/* Phases */}
                    <div className="space-y-16 md:space-y-24">
                        {phases.map((phase, index) => (
                            <div key={index} className="relative group">
                                <div className="flex items-start gap-6 md:gap-8">
                                    {/* Timeline Node */}
                                    <div className={`
                                        w-12 h-12 md:w-16 md:h-16 rounded-full shrink-0
                                        flex items-center justify-center
                                        backdrop-blur-sm border-2
                                        ${phase.status === 'completed' ? 'border-[#14F195] bg-[#14F195]/10' :
                                        phase.status === 'in-progress' ? 'border-[#9945FF] bg-[#9945FF]/10' :
                                        'border-white/10 bg-white/5'}
                                        transition-all duration-300 animate-float
                                    `}>
                                        <span className="text-sm md:text-base font-mono font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                                            {phase.timeline}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 backdrop-blur-sm bg-white/5 p-6 md:p-8 rounded-2xl border border-white/10 
                                        transition-all duration-300 hover:border-[#14F195]/50 hover:shadow-[0_0_30px_rgba(20,241,149,0.05)]">
                                        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#14F195] bg-clip-text text-transparent mb-6">
                                            {phase.title}
                                        </h3>
                                        <ul className="space-y-4">
                                            {phase.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3 group">
                                                    <span className="text-[#14F195] mt-1">•</span>
                                                    <span className="text-[#C4C4F3] group-hover:text-white/90 transition-colors">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-fadeIn {
                    animation: fadeIn 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Roadmap;
