import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`hp-button hp-button--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

type ActionLinkProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function ActionLink({
  children,
  variant = "primary",
  className = "",
  ...props
}: ActionLinkProps) {
  return (
    <a
      className={`hp-button hp-button--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </a>
  );
}
