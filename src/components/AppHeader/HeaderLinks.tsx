import Link from 'next/link';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import SwapfySwapIcon from 'src/icons/SwapfySwapIcon';
import SwapfyDocsIcon from 'src/icons/SwapfyDocsIcon';
import RoadmapIcon from 'src/icons/RoadmapIcon';
import SwapfyLiquidityIcon from 'src/icons/SwapfyLiquidityIcon';

// Add interface at the top, after imports
interface HeaderLinkProps {
    href: string;
    isActive?: boolean;
    title: string;
    icon: React.ReactNode;
    className?: string;
}

// Update the HeaderLink component with types
const HeaderLink: React.FC<HeaderLinkProps> = ({
    href,
    isActive,
    title,
    icon,
    className,
}) => {
    return (
        <Link
            href={href}
            className={classNames(
                'flex items-center font-semibold text-white/50 hover:text-white fill-current h-[60px] px-4',
                {
                    'bg-v3-bg !text-v3-primary': isActive,
                },
                className,
            )}
        >
            <span className="w-5">{icon}</span>
            <span className="ml-2 whitespace-nowrap">{title}</span>
        </Link>
    );
};

const HeaderLinks = () => {
    const { pathname } = useRouter();

    return (
        <div className="flex-1 justify-center hidden md:!flex text-sm h-full">
            <HeaderLink
                href="/swap"
                isActive={pathname === '/swap'}
                title={'Trade'}
                icon={<SwapfySwapIcon width="24" height="24" />}
            />
            <HeaderLink
                href="/liquidity"
                isActive={pathname === '/liquidity'}
                title={'Liquidity'}
                icon={<SwapfyLiquidityIcon width="24" height="24" />}
            />
            <HeaderLink
                href="/how-to"
                isActive={pathname === '/how-to'}
                title={'How To'}
                icon={<SwapfyDocsIcon width="24" height="24" />}
            />
            <HeaderLink
                href="roadmap"
                isActive={pathname === '/roadmap'}
                title={'Roadmap'}
                icon={<RoadmapIcon width="24" height="24" />}
            />
        </div>
    );
};

export default HeaderLinks;