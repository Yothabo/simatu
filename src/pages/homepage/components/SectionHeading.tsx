import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <header
      className={`hp-section-heading hp-section-heading--${align} ${className}`.trim()}
    >
      {eyebrow && (
        <span className="hp-eyebrow">{eyebrow}</span>
      )}

      <h2 className="hp-section-heading__title">{title}</h2>

      {description && (
        <p className="hp-section-heading__description">
          {description}
        </p>
      )}
    </header>
  );
}
