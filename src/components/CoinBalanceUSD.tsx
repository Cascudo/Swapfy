import { TokenInfo } from '@solana/spl-token-registry';
import Decimal from 'decimal.js';
import { useEffect, useMemo } from 'react';
import { useUSDValue } from 'src/contexts/USDValueProvider';
import { formatNumber, hasNumericValue } from 'src/misc/utils';

interface ComponentProps {
  tokenInfo: TokenInfo;
  amount?: number | string;
  maxDecimals?: number;
  prefix?: string;
}

export const CoinBalanceUSD = (props: ComponentProps) => {
  const { tokenInfo, amount, maxDecimals = 2, prefix = '' } = props;
  const { tokenPriceMap, getUSDValue } = useUSDValue();
  const address = tokenInfo?.address;

  // Get price from Jupiter price feed
  const tokenPrice = useMemo(() => {
    if (!address) return 0;
    const priceData = tokenPriceMap[address];
    return priceData?.usd || 0;
  }, [address, tokenPriceMap]);

  // Calculate USD value
  const amountInUSD = useMemo(() => {
    if (!amount || !hasNumericValue(amount) || !tokenPrice) {
      return new Decimal(0);
    }

    try {
      const amountDecimal = new Decimal(amount);
      return amountDecimal.mul(tokenPrice);
    } catch (e) {
      console.error('Error calculating USD value:', e);
      return new Decimal(0);
    }
  }, [amount, tokenPrice]);

  // Fetch price data if needed
  useEffect(() => {
    if (address) {
      getUSDValue([address]);
    }
  }, [address, getUSDValue]);

  // Format the USD value with appropriate precision
  const formattedValue = formatNumber.format(amountInUSD, maxDecimals);

  return (
    <>
      {prefix}${formattedValue}
    </>
  );
};