# CSC 414A Demo Repository Instructions

These project instructions supplement the global engineering and CI/CD rules. Read them before changing this repository.

## Project purpose and architecture

This repository is a frontend-only TypeScript/Vite demonstration application for the CSC 414A webinar on AI-assisted Test-Driven Development. It is a React 19 application using TanStack Start/Router, Vitest, Testing Library, SQL.js, and IndexedDB persistence. Application code lives under `src/`; tests live under `tests/`; the production build is emitted to the ignored `dist/` directory.

The application has three test layers:

- `tests/unit/` covers persistence and pure task behavior.
- `tests/ui/` covers React component behavior in jsdom.
- `tests/e2e/` covers browser-like user workflows in jsdom.

## Mandatory TDD workflow

Use the existing `superpowers:test-driven-development` skill for every feature, bug fix, refactor, or behavior change. Invoke it explicitly by name before writing production code. Do not create a replacement skill or silently simplify its Red–Green–Refactor procedure.

The skill is the authoritative detailed procedure. This repository adds human approval gates:

1. **RED proposal:** Read the requirements and acceptance criteria, propose the smallest tests and their target test command, and wait for developer approval.
2. **RED execution:** After approval, write the tests, run them, and confirm failures are caused by missing or incorrect behavior rather than setup, type, or configuration errors. Do not continue if the failure is unexplained.
3. **GREEN proposal:** Propose the minimum implementation and wait for developer approval.
4. **GREEN execution:** Implement only the behavior required by the approved failing tests, then run the targeted tests and relevant regression checks.
5. **REFACTOR proposal:** Identify safe behavior-preserving improvements and wait for developer approval before making them.
6. **REFACTOR execution:** Refactor only after approval and rerun the relevant tests plus the complete verification gate.

Never advance from RED to GREEN or GREEN to REFACTOR without the corresponding developer approval. These approval gates are instruction-based controls; the repository and GitHub Actions do not technically enforce conversational sequencing.

## Allowed and prohibited operations

Allowed operations are read-only reconnaissance, edits directly required by an approved task, existing project scripts, and temporary isolated test fixtures that are removed after validation.

Prohibited unless separately approved:

- New application features, UI redesign, unrelated refactoring, or production behavior changes.
- New dependencies, package installation, services, databases, or test frameworks.
- Changes to `.github/workflows/`, branch protection, deployment configuration, or global Codex settings.
- Reading, logging, or exposing secrets and environment files.
- Weakening, skipping, focusing, or deleting tests to obtain a passing result.
- Fabricating results, bypassing approval checkpoints, committing, pushing, or deploying.

Do not use unrestricted shell execution for application changes. Respect the configured Codex sandbox and approval policy. Use the existing `package-lock.json` and npm scripts.

## Verification commands

The complete local gate is:

```text
npm run verify
```

It runs these existing checks in order:

```text
npm run typecheck
npm run test:unit
npm run test:ui
npm run test:e2e
npm run build
```

Run the narrowest relevant command during iteration, then run `npm run verify` before reporting completion. The CI workflow remains the authoritative remote gate and runs the same checks in separate jobs on Node 22 with `npm ci`.

## Scope control and change management

Inspect `git status --short --branch` before work and preserve unrelated user changes. Keep changes minimal and limited to the approved task. Do not modify CI merely to accommodate a local failure. Do not claim that a check passed without fresh command output.

For failed commands, report the exact command, exit status, first meaningful failure, whether it is a product/configuration/environment issue, and the next safe action. Fix root causes instead of increasing timeouts, weakening assertions, or swallowing errors.

## Security and dependency restrictions

Do not install dependencies or alter lockfile resolutions without explicit developer approval. Do not access secrets unnecessarily. Treat input, filesystem, browser storage, and external network behavior as untrusted boundaries. Prefer existing dependencies and repository capabilities over adding infrastructure.
