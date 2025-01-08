const RoadmapIcon = ({ width = 16, height = 16 }: { width?: number | string; height?: number | string }) => {
    const gradientId = `roadmapGradient_${Math.random().toString(36)}`;
    
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 400 300" 
            width={width} 
            height={height}
            className="text-white"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9945FF" />
                    <stop offset="100%" stopColor="#14F195" />
                </linearGradient>
            </defs>
            <g transform="translate(50, 50)">
                <path
                    d="M0,0 L200,0 L250,50 L250,200 L0,200 Z"
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="20"
                    strokeLinejoin="round"
                />
                <g transform="translate(50, 70)">
                    <path
                        d="M0,0 L50,0 L75,25 L75,75 L0,75 Z"
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="10"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M25,25 L50,25 L62.5,37.5 L62.5,62.5 L25,62.5 Z"
                        fill={`url(#${gradientId})`}
                    />
                </g>
            </g>
        </svg>
    );
};

export default RoadmapIcon;