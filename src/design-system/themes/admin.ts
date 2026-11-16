import type { CSSProperties } from 'react';

import { primitives } from '../tokens/primitives';
import { adminColors } from '../tokens/adminColors';
import { adminTypography } from '../tokens/adminTypography';
import { colors } from '../tokens/colors';
import { adminSpacingVariables } from '../tokens/spacing';
import { adminTypographyTokens } from '../tokens/adminTypography';
import { spacing } from '../tokens/spacing';
import { elevationShadows, radiusTokens } from '../tokens/elevation';

const n = primitives.neutral;
const a = primitives.accent;
const status = primitives.status;

/**
 * Semantic tokens.
 * Components consume these names, never primitive hex values.
 */

const light = {
  colorBg: n.white,
  colorBgSurface: n.gray50,
  colorBgSurfaceSecondary: n.gray50,
  colorBgSurfaceSecondaryHover: n.gray100,

  colorBgFillPrimary: a.orange500,
  colorBgFillPrimaryHover: a.orange600,
  colorBgFillPrimaryActive: a.orange700,
  colorBgFillDisabled: n.gray100,

  colorTextPrimary: n.gray700,
  colorTextSecondary: n.gray500,
  colorTextTertiary: n.gray400,
  colorTextPrimaryDisabled: n.gray400,
  colorTextAccent: a.orange600,
  colorTextOnAccent: n.white,

  colorBorderPrimary: n.gray200,
  colorBorderSecondary: n.gray100,
  colorBorderTertiaryDefault: n.gray50,

  colorIconPrimary: n.gray700,
  colorIconSecondary: n.gray500,
  colorIconSecondaryHover: n.gray700,
  colorIconDisabled: n.gray300,

  colorFocusRing: a.orange600,

  colorStatusSuccess: status.success.light,
  colorBgStatusSuccess: status.success.backgroundLight,
  colorStatusWarning: status.warning.light,
  colorBgStatusWarning: status.warning.backgroundLight,
  colorStatusDanger: status.danger.light,
  colorBgStatusDanger: status.danger.backgroundLight,
} as const;

const dark = {
  colorBg: n.gray800,
  colorBgSurface: n.gray700,
  colorBgSurfaceSecondary: n.gray600,
  colorBgSurfaceSecondaryHover: n.gray500,

  colorBgFillPrimary: a.orange500,
  colorBgFillPrimaryHover: a.orange600,
  colorBgFillPrimaryActive: a.orange700,
  colorBgFillDisabled: n.gray600,

  colorTextPrimary: n.gray50,
  colorTextSecondary: n.gray200,
  colorTextTertiary: n.gray300,
  colorTextPrimaryDisabled: n.gray300,
  colorTextAccent: a.orange300,
  colorTextOnAccent: n.white,

  colorBorderPrimary: n.gray500,
  colorBorderSecondary: n.gray600,
  colorBorderTertiaryDefault: n.gray700,

  colorIconPrimary: n.gray50,
  colorIconSecondary: n.gray200,
  colorIconSecondaryHover: n.white,
  colorIconDisabled: n.gray400,

  colorFocusRing: a.orange300,

  colorStatusSuccess: status.success.dark,
  colorBgStatusSuccess: status.success.backgroundDark,
  colorStatusWarning: status.warning.dark,
  colorBgStatusWarning: status.warning.backgroundDark,
  colorStatusDanger: status.danger.dark,
  colorBgStatusDanger: status.danger.backgroundDark,
} as const;

export const adminThemes = {
  light,
  dark,
} as const;

export type AdminThemeMode = keyof typeof adminThemes;

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Converts the active TypeScript theme into runtime CSS variables.
 * The same semantic variable names are available to Tailwind and CSS.
 */
export function getAdminThemeCssVariables(
  mode: AdminThemeMode,
): CSSProperties {
  const theme = adminThemes[mode];
  const variables: Record<string, string> = {};

  Object.entries(theme).forEach(([key, value]) => {
    variables[`--ds-${toKebabCase(key)}`] = value;
  });

  Object.entries(adminTypographyTokens.styles).forEach(([name, style]) => {
    const tokenName = toKebabCase(name);

    variables[`--ds-font-size-${tokenName}`] = style.fontSize;
    variables[`--ds-line-height-${tokenName}`] = style.lineHeight;
    variables[`--ds-font-weight-${tokenName}`] = String(style.fontWeight);
  });

  variables['--ds-font-family-heading'] = adminTypographyTokens.family.heading;
  variables['--ds-font-family-body'] = adminTypographyTokens.family.body;

  const spacingVariables: Record<string, string> = {
    '1': spacing.xxs,
    '2': spacing.xs,
    '3': spacing.sm,
    '4': spacing.md,
    '5': spacing.lg,
    '6': spacing.xl,
    '8': spacing['2xl'],
    '10': spacing['3xl'],
    '12': spacing['4xl'],
    '16': spacing['5xl'],
  };

  Object.entries(spacingVariables).forEach(([key, value]) => {
    variables[`--ds-space-${key}`] = value;
  });

  Object.entries(radiusTokens).forEach(([key, value]) => {
    variables[`--ds-radius-${key}`] = value;
  });

  Object.entries(elevationShadows).forEach(([key, value]) => {
    variables[`--ds-shadow-${key}`] = value;
  });

  return variables as CSSProperties;
}

/**
 * Builds the full CSS-variable style object that the admin root element
 * needs to paint the theme. Extracted from pages/Admin.tsx so the block
 * isn't duplicated across shells.
 */
export function buildAdminThemeStyle(
  mode: AdminThemeMode,
): React.CSSProperties {
  const themeColors = adminColors.themes[mode];
  const charcoal40 =
    mode === 'dark' ? 'rgba(244, 241, 236, 0.4)' : colors.opacity.charcoal40;
  const charcoal50 =
    mode === 'dark' ? 'rgba(244, 241, 236, 0.5)' : colors.opacity.charcoal50;
  const charcoal70 =
    mode === 'dark' ? 'rgba(244, 241, 236, 0.7)' : colors.opacity.charcoal70;

  return {
    ...getAdminThemeCssVariables(mode),
    '--admin-bg': themeColors.background,
    '--admin-surface': themeColors.surface,
    '--admin-surface-subtle': themeColors.surfaceSubtle,
    '--admin-surface-raised': themeColors.surfaceRaised,
    '--admin-text-primary': themeColors.text,
    '--admin-text-secondary': themeColors.textSecondary,
    '--admin-text-supporting': themeColors.textSecondary,
    '--admin-text-muted': themeColors.textMuted,
    '--admin-text-disabled': themeColors.textDisabled,
    '--admin-border-subtle': themeColors.border,
    '--admin-border-strong': themeColors.borderStrong,
    // HARDCODED — category header background.
    // Light: #E2E2E2 / Dark: #3A3A3A
    '--admin-category-header-bg': mode === 'dark' ? '#3A3A3A' : '#E2E2E2',
    '--admin-hover': themeColors.hover,
    '--admin-accent': 'var(--admin-text-primary)',
    '--admin-accent-hover': 'var(--admin-text-secondary)',
    '--admin-accent-text': themeColors.accentText,
    '--admin-on-accent': 'var(--admin-bg)',
    '--admin-focus': themeColors.focus,
    '--admin-shadow': themeColors.shadow,
    '--admin-charcoal-40': charcoal40,
    '--admin-charcoal-50': charcoal50,
    '--admin-charcoal-70': charcoal70,
    '--admin-card-order-media-surface': themeColors.surfaceSubtle,
    '--admin-status-amber': colors.statusPalette.amber,
    '--admin-status-green': colors.statusPalette.green,
    '--admin-status-red': colors.statusPalette.red,

    ...adminSpacingVariables,

    '--admin-font-heading': adminTypography.heading,
    '--admin-font-body': adminTypography.body,

    '--admin-size-page-title': adminTypography.size.pageTitle,
    '--admin-size-section-title': adminTypography.size.sectionTitle,
    '--admin-size-card-title': adminTypography.size.cardTitle,
    '--admin-size-subsection-title': adminTypography.size.subsectionTitle,
    '--admin-size-body': adminTypography.size.body,
    '--admin-size-supporting': adminTypography.size.supporting,
    '--admin-size-micro': adminTypography.size.micro,

    '--admin-weight-normal': adminTypography.weight.normal,
    '--admin-weight-medium': adminTypography.weight.medium,
    '--admin-weight-semibold': adminTypography.weight.semibold,

    '--admin-line-tight': adminTypography.lineHeight.tight,
    '--admin-line-heading': adminTypography.lineHeight.heading,
    '--admin-line-body': adminTypography.lineHeight.body,
    '--admin-line-compact': adminTypography.lineHeight.compact,
  } as React.CSSProperties;
}
