const SwapfyDocsIcon = ({ width = 16, height = 16 }: { width?: string | number; height?: string | number }) => {
    const gradientId = `docsGradient_${Math.random().toString(36)}`;
    
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24"
            width={width}
            height={height}
            className="text-white"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9945FF"/>
                    <stop offset="100%" stopColor="#14F195"/>
                </linearGradient>
            </defs>
            
            {/* Main page with gradient fill */}
            <path 
                d="M6 4 L14 4 L18 8 L18 20 L6 20 Z" 
                fill={`url(#${gradientId})`}
                opacity="0.7"
            />
            
            {/* Border for definition */}
            <path 
                d="M6 4 L14 4 L18 8 L18 20 L6 20 Z" 
                stroke="currentColor" 
                strokeWidth="1"
                strokeLinejoin="round"
                fill="none"
            />
            
            {/* Folded corner with gradient */}
            <path 
                d="M14 4 L14 8 L18 8" 
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
                fill="none"
            />
            
            {/* Add some lines to make it look like a document */}
            <path
                d="M8 11 L16 11 M8 14 L16 14 M8 17 L13 17"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default SwapfyDocsIcon;