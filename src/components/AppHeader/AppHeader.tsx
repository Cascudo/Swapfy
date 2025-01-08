import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import CloseIcon from 'src/icons/CloseIcon';
import SwapfyIcon from 'src/icons/SwapfyIcon';
import MenuIcon from 'src/icons/MenuIcon';
import HeaderLinks from './HeaderLinks';
import HeaderLinksMobile from './HeaderLinksMobile';
import TopBanner from './TopBanner';
import V2SexyChameleonText from 'src/components/SexyChameleonText/V2SexyChameleonText';

const AppHeader: React.FC<{}> = () => {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const handleToggleMenu = () => setOpenMobileMenu(!openMobileMenu);

  useEffect(() => {
    const body = document.querySelector('body');
    if (openMobileMenu) {
      body!.style.overflow = 'hidden';
    } else {
      body!.style.overflow = '';
    }
  }, [openMobileMenu]);

  return (
    <>
       <TopBanner />
      
      <div className="flex items-center justify-between w-full bg-black/[.35]">
        <div className="flex items-center flex-1 p-4">
          <button onClick={handleToggleMenu} type="button" className="w-6 mr-3 md:hidden text-white">
            {openMobileMenu ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link href="/" shallow className="flex-1">
                      <div className="flex space-x-2">
                          <SwapfyIcon width="52" height="52" />
                          <V2SexyChameleonText className="text-4xl md:text-[36px] font-semibold px-4 pb-2 md:px-0">
                              SWAPFY
                          </V2SexyChameleonText>
                          <div className="px-1 py-0.5 bg-v3-primary rounded-md ml-2.5 font-semibold flex text-xs self-start">
                              v1
                          </div>
                      </div>
          </Link>
        </div>

        <HeaderLinks />

        <div className="flex-1" />
      </div>

      {openMobileMenu && (
        <div
          style={{
            height: 'calc(100vh - 70px)',
          }}
          className="z-[60] md:hidden fixed top-[60px] left-0 w-full bg-[rgba(62,62,69,0.85)] backdrop-blur-[20px]"
          onClick={handleToggleMenu}
        >
          <HeaderLinksMobile />
        </div>
      )}
    </>
  );
};

export default AppHeader;
