# SIMATU — Mandatory AI Development Governance

This document governs all AI-assisted development within the Simatu repository.
These rules are mandatory. They take priority over convenience, assumptions,
autonomous workflow decisions, and suggestions to create temporary workspaces.

The AI agent MUST read this document before beginning every coding task.

---

## 1. User Authority

The repository owner is the authority for:

- Branch creation
- Branch selection
- Branch switching
- Scope of implementation
- Architectural changes
- UI changes
- Commits
- Pushes
- Pull requests
- Merges
- Releases

The AI agent must never assume authorization for an action simply because
that action appears technically necessary or convenient.

If authorization is unclear, STOP and ask.

---

## 2. Strict Branch Creation Prohibition

The AI agent is STRICTLY PROHIBITED from creating branches.

This includes:

- Feature branches
- Fix branches
- Bug branches
- Temporary branches
- Testing branches
- Experiment branches
- Codex branches outside the approved workspaces
- Backup branches
- Branches created for comparison or isolation

A branch may only be created when the repository owner explicitly instructs
the AI agent to create a specific branch.

Instructions such as:

- "Implement this"
- "Fix this"
- "Refactor this"
- "Test this"
- "Investigate this"
- "Continue working"
- "Start working on this"

DO NOT constitute permission to create a branch.

The AI agent MUST work within the currently authorized branch.

---

## 3. Branch Switching Prohibition

The AI agent MUST NOT switch branches independently.

Before beginning work, it MUST:

1. Inspect the current branch.
2. Inspect the working tree.
3. Identify uncommitted changes.
4. Verify that the current branch is the authorized workspace.
5. Read and follow this document.

If the current branch is not the appropriate authorized workspace:

- Do not switch branches.
- Do not stash changes.
- Do not reset changes.
- Do not discard files.
- Do not create another branch.
- Stop and inform the repository owner.

Branch switching requires explicit user authorization.

---

## 4. Approved Permanent Branch Architecture

The following branches are authorized development workspaces. The repository
owner may explicitly authorize a broader task on an existing workspace.

### Admin

Branch:

Codex/admin-work

Scope:

- Admin dashboard
- Inventory management
- Admin operations
- Admin permissions
- Admin reporting permitted by project requirements
- Admin UI and components
- Admin-specific functionality

### Storefront

Branch:

Codex/storefront-work

Scope:

- Storefront experience
- Store-facing pages
- Product presentation
- Storefront functionality
- Storefront components and styling

### Cart and Checkout

Branch:

Codex/cart-work

Scope:

- Shopping cart
- Checkout
- Order processing
- Purchase flows
- Checkout validation
- Payment-related integration
- Cart and checkout components

### Homepage

Branch:

Codex/homepage-work

Scope:

- Homepage
- Hero sections
- Landing page
- Homepage navigation
- Homepage animations
- Homepage design system
- Homepage styling and responsiveness

### Integration and Local Testing

Branch:

Codex/local-work

Scope:

- Integrating approved subsystem work
- Cross-subsystem compatibility
- Integration testing
- Local application testing
- Latest stable working application tree

### Owner-directed integrated implementation

Branch:

codex/simatu-work

Scope, only when explicitly assigned by the repository owner:

- Coordinated Simatu marketplace architecture
- Marketplace-wide product and service taxonomy
- Cross-store classification and category migration
- Coordinated Yotaabo and Poshies storefront implementation
- Related application integration required by that explicitly assigned scope

This workspace does not authorize work outside the owner's stated task.
It does not authorize merges, pushes, or changes to protected branches.

No other permanent work branches are authorized unless the repository
owner explicitly authorizes them.

---

## 5. Merge Architecture

The standard subsystem integration destinations are:

Codex/admin-work       -> Codex/local-work
Codex/storefront-work  -> Codex/local-work
Codex/cart-work        -> Codex/local-work
Codex/homepage-work    -> Codex/local-work

Owner-directed integrated work on codex/simatu-work remains on that branch
unless the repository owner explicitly authorizes a separate integration.

The only standard beta integration path is:

Codex/local-work -> beta

Subsystem branches MUST NEVER merge directly into one another.

The AI agent MUST NOT perform any merge without explicit authorization
from the repository owner.

Approval of implementation does not automatically authorize a merge.

Each merge requires explicit authorization for its destination.

---

## 6. Protected Branches

### main

STRICTLY PROHIBITED.

The AI agent MUST NOT:

- Checkout main
- Modify main
- Commit to main
- Push to main
- Merge into main
- Reset main
- Delete main
- Use main as a development workspace

### beta

Protected integration destination.

The AI agent MUST NOT merge, push, modify, or release to beta without
explicit authorization from the repository owner.

### Codex/local-work

Integration and testing workspace.

Subsystem changes must be integrated here only after approval.

This branch must represent the latest integrated working application,
subject to testing and integration status.

---

## 7. Mandatory Pre-Work Procedure

Before modifying any code, the AI agent MUST:

1. Read this AGENTS.md file in full.
2. Inspect the current branch.
3. Inspect git status.
4. Identify all modified, staged, and untracked files.
5. Preserve all existing user changes.
6. Inspect the relevant source files.
7. Inspect related components, hooks, types, utilities, and tests.
8. Understand the existing implementation before proposing a replacement.
9. Identify the subsystem and verify that the current branch is authorized.
10. Establish a concise implementation plan for non-trivial tasks.

If the current branch is unauthorized for the task, STOP.

The AI agent MUST NOT claim it has inspected files that it has not actually
accessed.

---

## 8. Coding Standards

### General

- Preserve existing architecture unless a change is explicitly requested.
- Prefer small, focused, maintainable changes.
- Do not rewrite entire files unnecessarily.
- Do not introduce duplicate implementations.
- Do not make unrelated improvements during scoped tasks.
- Do not remove existing functionality without authorization.
- Do not introduce unnecessary dependencies.
- Follow the project's established naming and folder conventions.
- Prefer readable, explicit code over clever or unnecessarily abstract code.

### TypeScript

- Maintain type safety.
- Avoid any unless explicitly justified.
- Avoid unnecessary type assertions.
- Do not silence compiler errors to hide problems.
- Reuse existing types and interfaces.
- Keep types close to their relevant domain where established.

### React

- Reuse existing components and hooks.
- Keep components focused on their responsibilities.
- Avoid unnecessary state.
- Avoid duplicated business logic.
- Respect existing providers and application architecture.
- Preserve rendering behaviour unless changes are requested.
- Handle loading, error, empty, and success states appropriately.

### CSS and UI

- Respect the existing design system.
- Reuse semantic design tokens.
- Avoid introducing arbitrary colours, spacing, sizing, typography,
  border-radius, shadows, or motion values when established tokens exist.
- Avoid inline styling when the established architecture uses CSS.
- Do not redesign the interface during functional fixes or refactoring.
- Preserve responsive behaviour.
- Avoid global CSS changes when subsystem-scoped styles are sufficient.

### Architecture

- Inspect existing architecture before creating new folders or abstractions.
- Reuse existing utilities and services.
- Avoid unnecessary cross-subsystem coupling.
- Keep business logic separate from presentation where the architecture
  supports it.
- Do not introduce a second pattern for functionality that already has
  an established implementation.

---

## 9. Subsystem Isolation

Work must remain within the subsystem assigned by the repository owner.

Admin work must not unnecessarily modify storefront, homepage, cart,
or checkout.

Storefront work must not unnecessarily modify admin, homepage, cart,
or checkout.

Cart and checkout work must not unnecessarily modify admin or storefront.

Homepage work must not unnecessarily modify admin, cart, checkout,
or storefront.

Cross-subsystem changes require an explanation and explicit authorization
when they exceed the original task scope.

The repository owner may explicitly authorize coordinated cross-subsystem
implementation on codex/simatu-work. Such authorization applies only to
the stated task scope.

The Storefront must remain untouched during Admin tasks unless the
repository owner explicitly authorizes changes to it.

---

## 10. Customer Data Restrictions

Customer name and phone number collected during checkout are used strictly
for order processing and fulfilment.

Do not introduce customer:

- Profiles
- Segmentation
- Customer analytics
- Customer comparisons
- Lifetime value tracking
- Repeat-customer reporting
- Marketing analytics

unless the repository owner explicitly authorizes a change to this policy.

Retain only the customer information necessary for order processing
and fulfilment.

---

## 11. User Data and Existing Work Protection

Before modifying files, inspect the working tree.

The AI agent MUST preserve:

- Uncommitted changes
- Staged changes
- Untracked files
- Local commits
- User-created backups
- Existing work in progress

The AI agent MUST NOT independently:

- Run git reset --hard
- Run git clean
- Discard changes
- Overwrite user files
- Delete backups
- Stash changes
- Restore files from another branch
- Revert user changes
- Force push
- Rewrite history

Any action that could destroy or hide existing work requires explicit
authorization.

---

## 12. Testing and Verification

Before reporting implementation as complete, run applicable checks.

Depending on the scope, checks may include:

- TypeScript checks
- Unit tests
- Component tests
- Integration tests
- Production builds
- Lint checks
- Git diff checks
- Runtime testing
- Responsive UI testing

The AI agent MUST distinguish between:

- Checks actually executed
- Checks that passed
- Checks that failed
- Checks that could not be executed
- Functionality that has not been manually verified

Never claim a build, test, or runtime check passed without executing it.

---

## 13. Git Operations

Git operations must be conservative.

The AI agent MUST NOT independently:

- Create branches
- Switch branches
- Commit
- Push
- Merge
- Rebase
- Cherry-pick
- Reset
- Force push
- Delete branches
- Delete tags

unless the repository owner explicitly authorizes the specific operation.

Permission to perform one Git operation does not imply permission
to perform other Git operations.

---

## 14. Completion Report

At the end of every coding task, provide a factual summary containing:

1. What changed
2. Files affected
3. Why the changes were made
4. Tests and checks executed
5. Results
6. Outstanding risks or limitations
7. Git status and branch information when available

Do not claim completion of tasks that were not completed.

Do not claim access to the user's local filesystem unless access was
actually available.

---

## 15. Mandatory Stop Conditions

STOP immediately and ask the repository owner when:

- The current branch is unauthorized.
- The task requires creating a branch.
- The task requires switching branches without authorization.
- Existing changes may be overwritten.
- The requested scope conflicts with these rules.
- The task requires modifying protected areas.
- A merge destination is unclear.
- A destructive Git operation appears necessary.
- The implementation requires an architectural decision outside the
  approved scope.

Never bypass these stop conditions for convenience.

---

## 16. Final Principle

Simatu uses permanent, dedicated subsystem workspaces, with owner-directed
integrated work permitted when explicitly assigned.

The AI agent is an implementation assistant, not the branch manager,
release manager, or repository owner.

The repository owner's explicit instructions govern branch creation,
branch switching, scope, integration, approval, and release.

When in doubt: STOP, preserve the working tree, and ASK.

---

## 17. Mandatory Workspace and Branch Authorization

This section reinforces and supersedes any ambiguous interpretation of
previous branch instructions.

### No autonomous branch creation

The AI agent MUST NOT create any branch under any circumstances unless
the repository owner explicitly authorizes creation of a specifically
named branch.

Creating a branch for convenience, testing, parallel work, isolation,
recovery, or comparison is prohibited.

### No autonomous branch switching

The AI agent MUST NOT switch branches without explicit user authorization.

### Authorized workspaces

- Admin: Codex/admin-work
- Storefront: Codex/storefront-work
- Cart and checkout: Codex/cart-work
- Homepage: Codex/homepage-work
- Integration and testing: Codex/local-work
- Owner-directed integrated implementation: codex/simatu-work, only for
  tasks explicitly assigned by the repository owner

### Workspace verification

Before every implementation task, the AI agent MUST verify the current
branch and ensure it matches the authorized workspace.

If the current branch does not match:

- Do not switch.
- Do not create a branch.
- Do not cherry-pick.
- Do not merge.
- Do not stash.
- Do not alter the working tree to force compliance.

Stop and request direction from the repository owner.

### Mandatory documentation reading

AGENTS.md MUST be read at the beginning of every Simatu coding task.

Reading it in a previous session does not exempt the AI agent from
reading it again.

### Authorization

Approval to implement is not approval to commit.
Approval to commit is not approval to push.
Approval to push is not approval to merge.

Approval to merge a subsystem into Codex/local-work is not approval
to merge Codex/local-work into beta.

Each action requires the appropriate explicit authorization.

### CI limitations

GitHub Actions branch-governance checks validate pull request paths.
They do not detect uncommitted local changes or independently prevent
branch creation.

Technical enforcement of branch protection, direct-push restrictions,
and branch creation permissions must be configured through GitHub
repository rulesets and permissions.
