import React from 'react';

const JupiterLogo: React.FC<{ width?: number; height?: number }> = ({ width = 24, height = 24 }) => {
  // eslint-disable-next-line @next/next/no-img-element
    return <img src={'/swapfy-logo.svg'} width={width} height={height} alt="Decentralized Excahnge and Liquidity Aggregator" />;
};

export default JupiterLogo;
