# Simatu Repository Governance

## Branch policy

- Never operate on `main`: do not checkout, fetch specifically for modification, commit, push, merge, rebase, reset, delete, or otherwise change it.
- `beta` is protected from AI agents and remote automation. Never checkout, commit, push, merge, rebase, reset, delete, or otherwise modify `beta`.
- All AI/remote development happens on remote feature/fix branches, not on `beta` or `main`.
- Remote integration target: `codex/simatu-work`. Integrate into it only when the developer explicitly authorizes the integration.
- The developer's local branch is named `Simatu`. The developer pulls approved `codex/simatu-work` integration into local `Simatu`, reviews and tests locally, then performs the final commit and push to `beta`.
- The only permitted promotion to `beta` is a developer-controlled local push. No remote automation or AI agent may push to `beta`.
- Never push directly to `codex/simatu-work` unless explicitly authorized.
- Pull requests from remote work should target `codex/simatu-work`; PRs targeting `beta` or `main` are prohibited by branch governance checks.

## Git safety

- Never force-push.
- Never discard, overwrite, reset, or clean user changes.
- Do not commit or push unless explicitly instructed.
- Before any Git mutation, confirm the current branch and working tree.
- Preserve unrelated and untracked files.
- Do not create additional worktrees or workspaces unless explicitly requested.

## Development

- Follow existing code patterns and project scripts.
- Inspect and refactor before altering UI behavior.
- Run relevant checks and report actual results; do not claim checks passed unless executed.
- Keep storefronts unchanged when the task is admin-only.
- Checkout name and phone are order-fulfillment fields only; do not introduce customer profiles, segmentation, comparison, lifetime value, or customer analytics.
