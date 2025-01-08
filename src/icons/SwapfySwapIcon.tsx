// SwapfySwapIcon.tsx
const SwapfySwapIcon = ({ width = 16, height = 16 }: { width?: string | number; height?: string | number }) => {
    const gradientId = `swapGradient_${Math.random().toString(36)}`;
    
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
            
            {/* Base path with solid color for fallback */}
            <path 
                d="M6 12 C6 9 8 9 10 9 C12 9 14 15 16 15 C18 15 20 15 20 12 C20 9 18 9 16 9 C14 9 12 15 10 15 C8 15 6 15 6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
            
            {/* Gradient overlay */}
            <path 
                d="M6 12 C6 9 8 9 10 9 C12 9 14 15 16 15 C18 15 20 15 20 12 C20 9 18 9 16 9 C14 9 12 15 10 15 C8 15 6 15 6 12"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
};

export default SwapfySwapIcon;