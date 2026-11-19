# Folder ownership map

```text
src/
  app/                         # application composition, routing, providers, global styles
  systems/
    homepage/                  # corporate homepage
    storefront/
      core/                    # system-wide commerce behaviour and contracts
      stores/
        yotaabo/               # Yotaabo-specific experience and local design system
        poshies/               # Poshies-specific experience and local design system
      shared-design-systems/   # explicitly shared storefront design systems
      integrations/            # storefront-owned external integrations
    admin/                     # Admin pages, features, services, types, assets and design system
  shared/                      # system-neutral infrastructure only
```

Public static assets follow `public/systems/homepage/`, `public/systems/storefront/yotaabo/`, `public/systems/storefront/poshies/`, and `public/systems/admin/`.

The map describes the target. Existing legacy folders are migrated incrementally; new system-owned files must use the target locations immediately.
