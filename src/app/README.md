# Application composition

This directory owns the application shell: route registration, route guards, top-level provider composition, startup configuration, and truly global styles.

System-specific providers should be mounted at their route boundary rather than wrapping unrelated systems. For example, the cart provider belongs around Storefront routes, not Homepage or Admin routes. The current root-level App is migrated here only after its provider and route dependencies have been separated safely.
