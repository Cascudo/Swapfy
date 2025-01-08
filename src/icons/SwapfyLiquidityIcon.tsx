const SwapfyLiquidityIcon = ({ width = 32, height = 32 }: { width?: string | number; height?: string | number }) => {
    const gradientId = `liquidityGradient_${Math.random().toString(36)}`;
    
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={width}
            height={height}
            className="text-white"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9945FF" />
                    <stop offset="100%" stopColor="#14F195" />
                </linearGradient>
            </defs>
            <circle cx="9" cy="12" r="6" fill={`url(#${gradientId})`} />
            <circle cx="15" cy="12" r="6" fill={`url(#${gradientId})`} opacity="0.7" />
        </svg>
    );
};

export default SwapfyLiquidityIcon;