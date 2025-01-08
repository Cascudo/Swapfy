import React from 'react';
import JupButton from './JupButton';
import Decimal from 'decimal.js';

interface PercentageButtonsProps {
  balance: string | null;
  fromTokenInfo: any;
  onSetAmount: (value: string) => void;
}

const PercentageButtons: React.FC<PercentageButtonsProps> = ({ balance, fromTokenInfo, onSetAmount }) => {
  const handlePercentageClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>, percentage: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!balance) return;
    
    const balanceDecimal = new Decimal(balance);
    const amount = balanceDecimal.mul(percentage).div(100);
    onSetAmount(amount.toString());
  }, [balance, onSetAmount]);

  return (
    <div className="flex gap-1 my-1" onClick={(e) => e.stopPropagation()}>
      <JupButton 
        size="sm" 
        type="button"
        onClick={(event) => handlePercentageClick(event, 25)}
        className="text-xs py-1 px-2 min-w-[40px]"
      >
        25%
      </JupButton>
      <JupButton 
        size="sm"
        type="button" 
        onClick={(event) => handlePercentageClick(event, 50)}
        className="text-xs py-1 px-2 min-w-[40px]"
      >
        50%
      </JupButton>
      <JupButton 
        size="sm"
        type="button" 
        onClick={(event) => handlePercentageClick(event, 75)}
        className="text-xs py-1 px-2 min-w-[40px]"
      >
        75%
      </JupButton>
      <JupButton 
        size="sm"
        type="button" 
        onClick={(event) => handlePercentageClick(event, 100)}
        className="text-xs py-1 px-2 min-w-[40px]"
      >
        Max
      </JupButton>
    </div>
  );
};

export default React.memo(PercentageButtons);