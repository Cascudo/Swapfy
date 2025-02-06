import classNames from 'classnames';
import React, { HTMLAttributes, useMemo } from 'react';

interface ISwapSettingButton {
  idx: number;
  itemsCount: number;
  className?: HTMLAttributes<HTMLButtonElement>['className'];
  onClick(): void;
  highlighted: boolean;
  roundBorder?: 'left' | 'right';
  children: React.ReactNode;
}

const SwapSettingButton = ({
  idx,
  itemsCount,
  className = '',
  onClick,
  highlighted,
  roundBorder,
  children,
}: ISwapSettingButton) => {
  // Use the "settings-button" class (from your global CSS) plus the original background and transitions
  const baseClasses = classNames(
    'settings-button', // relies on .settings-button { height: 42px !important; etc. }
    'relative flex-1 text-white/50 bg-[#1B1B1E]',
    'transition-all duration-200 ease-in-out',
  );

  // Determine if left or right border should be rounded
  const roundBorderClass = (() => {
    if (roundBorder === 'left') return 'rounded-l-xl';
    if (roundBorder === 'right') return 'rounded-r-xl';
    return '';
  })();

  // Only apply left-border if this is not the first or last button
  const borderClassName = useMemo(() => {
    if (idx > 0 && idx < itemsCount) return 'border-l border-white/10';
  }, [idx, itemsCount]);

  return (
    <button
      type="button"
      className={classNames(
        baseClasses,
        'relative border border-transparent',
        borderClassName,
        highlighted ? `${roundBorderClass} !border-v3-primary` : '',
        className,
      )}
      onClick={onClick}
    >
      {/* 
          "priority-button" is also from your global CSS. 
          We optionally add 'h-full w-full flex items-center justify-center' 
          so it visually centers and spans the button if desired.
      */}
      <div
        className={classNames(
          'priority-button',
          'w-full h-full flex items-center justify-center',
        )}
      >
        {children}
      </div>
    </button>
  );
};

export default SwapSettingButton;
