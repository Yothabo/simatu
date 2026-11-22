# SIMATU Guided Workflows (isolated foundation)

This folder contains a reusable guided input engine and workflow definitions. **It is intentionally not wired to routes, homepage, storefront, cart, checkout, or admin.** It has no live API/Supabase submission adapter. Preview completion is local-only.

## Included building blocks
- Typed workflow, step, field, value, draft and validation contracts
- Field renderer (text, email, phone, URL, numeric/currency, textarea, select, multiselect, checkbox/toggle, file/image)
- Workflow shell (step indicator, progress, footer navigation)
- Step validation
- Local draft persistence, version-scoped
- Preview component that can be imported by a future internal test harness
- Workflow registry and isolated CSS

## Prepared workflow definitions
- Network application
- Product creation
- Product editing
- Business/storefront request
- Administrator setup
- Support request / report
- Inventory adjustment
- Storefront details/edit
- Feedback

## Planned inventory (not yet configured)
- Checkout and customer details (kept live checkout untouched)
- Account/profile editing
- Invitation acceptance/activation specifics
- Business/storefront onboarding completion
- Product variant-specific data (conditional field sets)
- Order support / delivery issue variants

## Integration rules
1. Do not import this folder from live app routes/components.
2. Keep live forms unchanged while the foundation is built.
3. Add real submission adapters only during an explicitly approved workflow migration.
4. Use Guided mode for complex tasks, Quick Entry for experienced users, and table/bulk operations for high-volume editing.
5. Preview completion does not persist to backend or send messages.
