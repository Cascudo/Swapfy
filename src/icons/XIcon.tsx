import React from 'react';

const XIcon = ({ width = 24, height = 24 }: { width?: string | number; height?: string | number }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width={width} height={height}>
            <defs>
                <linearGradient id="xIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9945FF" />
                    <stop offset="100%" stopColor="#14F195" />
                </linearGradient>
            </defs>
            <path
                d="M42.5,31.2L66,6h-6L39.8,27.6L24,6H4l24.6,33.6L4,66
          h6l21.3-22.8L48,66h20L42.5,31.2z M12.9,10h8l38.1,52h-8L12.9,10z"
                fill="url(#xIconGradient)"
            />
        </svg>
    );
};
export default XIcon;