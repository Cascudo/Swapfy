import Link from 'next/link';
import { SpeedInsights } from "@vercel/speed-insights/next"
import TelegramIcon from 'src/icons/TelegramIcon';
import XIcon from 'src/icons/XIcon';
import PumpFunIcon from 'src/icons/PumpFunIcon';

const Footer = () => {
    return (
        <footer className="flex flex-col md:flex-row text-center justify-center items-center p-4 text-sm text-white gap-4">
            <div className="flex items-center space-x-4">
            <Link href="https://dexscreener.com/solana/2s619gmeo2cega2wpyeeb81mnn3ezb5gunvgqye3ssh5" target="_blank">
                    <PumpFunIcon width={28} height={28} />
                </Link>
                <Link href="https://x.com/swapfydotfun" target="_blank">
                    <XIcon width={28} height={28} />
                </Link>
                <Link href="https://t.me/swapfydotfun" target="_blank">
                    <TelegramIcon width={28} height={28} />
                </Link>
                <p><b>Join our Community</b> &copy; {new Date().getFullYear()}</p>
            </div>
            <div className="flex items-center space-x-4 text-[#C4C4F3]">
                <Link 
                    href="/terms-conditions" 
                    className="hover:text-[#14F195] transition-colors"
                >
                    Terms & Conditions
                </Link>
                <span>•</span>
                <Link 
                    href="/privacy-policy" 
                    className="hover:text-[#14F195] transition-colors"
                >
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
};

export default Footer;