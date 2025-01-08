import React from 'react';

const LiquidityIcon: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">

          <circle 
    cx="10" 
    cy="12" 
    r="6" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  />
  <circle 
    cx="14" 
    cy="12" 
    r="6" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  />
  
   <path 
    d="M12 7l2 2-2 2M12 15l-2 2 2 2" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    fill="none"
  />
</svg>
  );
};

export default LiquidityIcon;
