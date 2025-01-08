// SwapfyIcon.tsx
import React from 'react';

const SwapfyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
    const gradientId = `chameleonGradient1_${Math.random().toString(36)}`;
    
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            {...props}
        >
            <defs>
                <linearGradient
                    id={gradientId}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#6B46C1">
                        <animate
                            attributeName="stop-color"
                            values="#6B46C1; #4ECDC4; #8B5CF6; #2DD4BF; #6B46C1"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </stop>
                    <stop offset="100%" stopColor="#38BDF8">
                        <animate
                            attributeName="stop-color"
                            values="#38BDF8; #2DD4BF; #4ADE80; #4ECDC4; #38BDF8"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </stop>
                </linearGradient>
            </defs>
            <path d="M 30 15 L 90 15 L 75 30 L 15 30 Z"
                fill={`url(#${gradientId})`} />
            <path d="M 15 40 L 80 40 L 90 55 L 25 55 Z"
                fill={`url(#${gradientId})`} />
            <path d="M 30 65 L 90 65 L 75 80 L 15 80 Z"
                fill={`url(#${gradientId})`} />
        </svg>
    );
};

export default SwapfyIcon;