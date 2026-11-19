import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

export default function Eyebrow({
  children,
  className = "",
}: EyebrowProps) {
  return (
    <span className={`hp-eyebrow ${className}`.trim()}>
      {children}
    </span>
  );
}
