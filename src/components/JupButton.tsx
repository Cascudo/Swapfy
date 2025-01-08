import classNames from 'classnames';
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface IJupButton {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  highlighted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  bgClass?: string;
  rounded?: string;
}

const JupButton = React.forwardRef(
  (
    { onClick, disabled, children, highlighted, className = '', size = 'md', type, bgClass, rounded }: IJupButton,
    ref: React.ForwardedRef<any>,
  ) => {
    const contentClass = (() => {
      if (size === 'sm') {
        return 'px-4 py-2.5 text-xs !font-[Inter] !font-normal !text-opacity-100';
      }
      if (size === 'md') {
        return 'px-4 py-3 text-sm !font-[Inter] font-semibold !text-opacity-100';
      }
      if (size === 'lg') {
        return 'p-5 text-md !font-[Inter] font-semibold !text-opacity-100';
      }
    })();
    const background = bgClass || 'text-white bg-[#191B1F] dark:bg-black/50';
    return (
      <button
        type={type}
        ref={ref}
        className={classNames({
          'relative text-current [text-rendering:optimizeLegibility] [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]': true,
          'jup-gradient': highlighted,
          'opacity-50 cursor-not-allowed': disabled,
          [background]: true,
          [className]: true,
          [rounded || 'rounded-xl']: true,
        })}
        disabled={disabled}
        onClick={onClick}
      >
        <div className={`${contentClass} h-full w-full leading-none !text-inherit`}>{children}</div>
      </button>
    );
  },
);

JupButton.displayName = 'JupButton';

export default JupButton;