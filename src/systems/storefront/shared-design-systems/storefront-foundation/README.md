# Storefront foundation

This is the shared structural foundation selected by the current stores.

The foundation owns reusable component primitives and design-system mechanics: spacing, sizing, breakpoints, radius, layout, motion and component geometry. It does not own brand colors, semantic palette values, font families, brand copy or store-specific visual treatments.

Each store supplies the semantic token values consumed by shared components through its scoped stylesheet under `stores/<store>/design-system/`.

Do not place Yotaabo-only or Poshies-only components, copy, or styling here. Keep business logic in Storefront core and visual primitives in this directory.
