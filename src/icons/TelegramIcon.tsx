const TelegramIcon = ({ width = 24, height = 24 }: { width?: string | number; height?: string | number }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width={width} height={height}>
            <defs>
                <linearGradient id="telegramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9945FF" />
                    <stop offset="100%" stopColor="#14F195" />
                </linearGradient>
            </defs>
            <path
                d="M65.5,7.7l-60.7,26c-1.2,0.5-1.2,2.2,0,2.6l11.1,4.5c2.1,0.9,4.5,0.7,6.4-0.5l34.5-21.3c0.4-0.3,0.7,0.3,0.4,0.6L35.9,40
        c-3.2,3-2.9,8.2,0.6,10.8l1.4,1.1l15.5,11.8c2.1,1.6,5.1,0.4,5.6-2.2l9-51.9C68.2,8.2,66.8,7.1,65.5,7.7z"
                fill="url(#telegramGradient)" />
        </svg>
    );
};
export default TelegramIcon;
