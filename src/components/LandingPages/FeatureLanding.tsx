import React from 'react';
import { Mail } from 'lucide-react';

interface FeatureLandingProps {
    title: string;
    subtitle: string;
    description: string;
    features: string[];
}

const FeatureLanding: React.FC<FeatureLandingProps> = ({
    title,
    subtitle,
    description,
    features
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#13111C] to-[#170F2D] relative overflow-hidden">
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#9945FF] opacity-10 blur-[150px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#14F195] opacity-10 blur-[150px] translate-x-1/2" />

            <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-block animate-float">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#14F195] bg-clip-text text-transparent">
                            {title}
                        </h1>
                    </div>
                    <p className="text-xl text-[#C4C4F3] mb-8 animate-fadeIn">{subtitle}</p>
                    <div className="max-w-3xl mx-auto backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                        <p className="text-lg text-white/80">{description}</p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 transition-all duration-300 hover:border-[#14F195]/50 hover:shadow-[0_0_20px_rgba(20,241,149,0.1)] cursor-pointer"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-bold">
                                    {index + 1}
                                </div>
                                <p className="text-white/90 text-lg group-hover:text-white transition-colors">{feature}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Waitlist Form */}
                <div className="max-w-md mx-auto backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4">Join Swapfy Beta</h2>
                    <p className="text-[#C4C4F3] mb-6">Be the first to experience the future of Solana DeFi.</p>
                    <form className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#14F195] transition-colors"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                        >
                            <Mail size={20} />
                            <span>Get Early Access</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[#C4C4F3] mb-4">Join our community</p>
                        <div className="flex justify-center space-x-6">
                            <a href="#" className="text-white/70 hover:text-[#14F195] transition-colors">Twitter</a>
                            <a href="#" className="text-white/70 hover:text-[#14F195] transition-colors">Discord</a>
                        </div>
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

export default FeatureLanding;