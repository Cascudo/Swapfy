// src/components/SwapTerminal/index.tsx
import React from 'react';
import SwapfyIcon from 'src/icons/SwapfyIcon';
import V2SexyChameleonText from 'src/components/SexyChameleonText/V2SexyChameleonText';
import IntegratedTerminal from 'src/content/IntegratedTerminal';
import { DEFAULT_EXPLORER } from 'src/types';

interface SwapTerminalProps {
  rpcUrl: string;
  watchAllFields: {
    refetchIntervalForTokenAccounts: number;
    formProps: any;
    simulateWalletPassthrough: boolean;
    strictTokenList: boolean;
    defaultExplorer: DEFAULT_EXPLORER;
    useUserSlippage: boolean;
  };
  ShouldWrapWalletProvider: React.ComponentType<{ children: React.ReactNode }>;
  showLogo?: boolean;
  onTokenPairChange?: (fromMint: string, toMint: string) => void; 
}

const SwapTerminal: React.FC<SwapTerminalProps> = ({
  rpcUrl,
  watchAllFields,
  ShouldWrapWalletProvider,
  showLogo = true,
  onTokenPairChange 
}) => {
  return (
    <div className="">
      {showLogo && (
  <div className="hidden md:flex flex-col items-center h-full w-full mt-8">
    <div className="flex flex-col justify-center items-center text-center">
      <div className="flex space-x-2">
        <SwapfyIcon width="52" height="52" />
        <V2SexyChameleonText className="text-[36px] font-semibold px-0">
          SWAPFY
        </V2SexyChameleonText>
        <div className="px-1 py-0.5 bg-v3-primary rounded-md ml-2.5 font-semibold flex text-xs self-start">
          v1
        </div>
      </div>
      <p className="text-[#9D9DA6] max-w-[80%] text-md mt-2 mb-2 heading-[24px]">
        Lightning fast trades across multiple liquidity pools.
      </p>
    </div>
  </div>
)}
      <div className="flex justify-center flex-grow">
        <div className="max-w-[480px] bg-black/05 rounded-xl flex flex-col md:flex-row w-full md:p-4 relative">
          <ShouldWrapWalletProvider>
            <div className="mt-4 md:mt-0 h-full w-full flex flex-col flex-grow">
              <IntegratedTerminal
                rpcUrl={rpcUrl}
                refetchIntervalForTokenAccounts={watchAllFields.refetchIntervalForTokenAccounts}
                formProps={watchAllFields.formProps}
                simulateWalletPassthrough={watchAllFields.simulateWalletPassthrough}
                strictTokenList={watchAllFields.strictTokenList}
                defaultExplorer={watchAllFields.defaultExplorer}
                useUserSlippage={watchAllFields.useUserSlippage}
                onTokenPairChange={onTokenPairChange}
              />
            </div>
          </ShouldWrapWalletProvider>
        </div>
      </div>
    </div>
  );
};

export default SwapTerminal;