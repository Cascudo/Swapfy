import Link from 'next/link';
import React from 'react';
import RoadmapIcon from 'src/icons/RoadmapIcon';
import SwapfyDocsIcon from 'src/icons/SwapfyDocsIcon';
import SwapfySwapIcon from 'src/icons/SwapfySwapIcon';
import SwapfyLiquidityIcon from 'src/icons/SwapfyLiquidityIcon';

const HeaderLink: React.FC<{
    external?: boolean;
    href: string;
    icon: React.ReactNode;
    label: string | React.ReactNode;
}> = ({ external, href, icon, label }) => {
    return (
        <Link
            href={href}
            shallow
            className="bg-white/10 flex items-center px-5 py-4 rounded-xl"
            {...(external
                ? {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                }
                : {})}
        >
            <span className="flex items-center justify-center h-9 w-9 rounded-full text-white/50 fill-current bg-black/25">
                {icon}
            </span>
            <p className="ml-5 font-medium">{label}</p>
        </Link>
    );
};

const HeaderLinksMobile: React.FC = () => {
    return (
        <div className="px-5 py-4 text-base text-white space-y-2">
            <HeaderLink
                href="/swap"
                label={'Swap'}
                icon={<SwapfySwapIcon width="24" height="24" />}
            />
            <HeaderLink
                href="/liquidity"
                label={'Liquidity'}
                icon={<SwapfyLiquidityIcon width="24" height="24" />}
            />
            <HeaderLink
                href="/how-to"
                label={'How to'}
                icon={<SwapfyDocsIcon width="24" height="24" />}
            />
            <HeaderLink
                href="/roadmap"
                label={'Roadmap'}
                icon={<RoadmapIcon width="24" height="24" />}
            />
        </div>
    );
};

export default HeaderLinksMobile;