import { useState, MouseEvent, ReactNode } from 'react';

type RippleButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  rippleColor?: string;
};

type Ripple = {
  key: number;
  x: number;
  y: number;
};

export default function RippleButton({ onClick, children, className = '', ariaLabel, rippleColor = '#8aa89b' }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = { key: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
    }, 600);

    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`relative overflow-hidden ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      {/* Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.key}
          className="pointer-events-none absolute rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '200%',
            height: '200%',
            backgroundColor: `${rippleColor}66`,
          }}
        />
      ))}
    </button>
  );
}
