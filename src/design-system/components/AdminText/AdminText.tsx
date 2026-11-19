import type { CSSProperties, ElementType, ReactNode } from 'react';

type AdminTextVariant =
  | 'display'
  | 'page-title'
  | 'section-title'
  | 'card-title'
  | 'metric'
  | 'metric-label'
  | 'metric-description'
  | 'body'
  | 'supporting'
  | 'micro';

type AdminTextProps = {
  variant: AdminTextVariant;
  children: ReactNode;
  as?: ElementType;
  numeric?: boolean;
  truncate?: boolean;
  uppercase?: boolean;
  className?: string;
  style?: CSSProperties;
};

const VARIANT_DEFAULTS: Record<AdminTextVariant, ElementType> = {
  display: 'h1',
  'page-title': 'h1',
  'section-title': 'h2',
  'card-title': 'h3',
  metric: 'strong',
  'metric-label': 'span',
  'metric-description': 'span',
  body: 'p',
  supporting: 'p',
  micro: 'span',
};

export default function AdminText({
  variant,
  children,
  as,
  numeric = false,
  truncate = false,
  uppercase = false,
  className = '',
  style,
}: AdminTextProps) {
  const Tag = as ?? VARIANT_DEFAULTS[variant];

  const classes = [
    'admin-text',
    `admin-text-${variant}`,
    numeric ? 'admin-text-numeric' : '',
    uppercase ? 'admin-text-uppercase' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      className={classes}
      style={{
        ...(truncate
          ? {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }
          : {}),
        ...(style ?? {}),
      }}
    >
      {children}
    </Tag>
  );
}
