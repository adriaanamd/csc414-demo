# CSC 414A AI-Assisted TDD Demo

This repository contains the frontend-only demo application for the CSC 414A seminar on **AI-Assisted Test-Driven Development**.

The application is a React/Vite to-do list with SQL.js and IndexedDB persistence. It uses TypeScript, TanStack Start/Router, Vitest, and Testing Library.

## Prerequisites

- Node.js 22 or newer
- npm

The GitHub Actions workflow uses Node.js 22 and installs from the committed lockfile with `npm ci`.

## Local setup

```bash
npm ci
npm run dev
```

The development server is available at `http://localhost:5173`.

## Verification

Run the complete local quality gate:

```bash
npm run verify
```

This runs the existing checks in the same order as the project workflow:

```text
npm run typecheck
npm run test:unit
npm run test:ui
npm run test:e2e
npm run build
```

Individual commands are useful during iteration:

| Command | Purpose |
| --- | --- |
| `npm run test:unit` | Persistence and pure behavior tests |
| `npm run test:ui` | React component tests in jsdom |
| `npm run test:e2e` | Browser-like workflow tests in jsdom |
| `npm run typecheck` | TypeScript validation |
| `npm run build` | Production bundle and prerender validation |
| `npm test` | All Vitest suites together |

## Controlled TDD workflow

The repository uses the existing `superpowers:test-driven-development` skill. Invoke it explicitly before implementing a feature, bug fix, refactor, or behavior change:

```text
Use superpowers:test-driven-development for this task.
```

The workflow is human-in-the-loop:

1. **RED proposal:** Read the requirement and propose the smallest behavior-focused tests. Wait for approval.
2. **RED execution:** Write the tests and run them. Confirm the failure is caused by missing or incorrect behavior.
3. **GREEN proposal:** Propose the minimum implementation. Wait for approval.
4. **GREEN execution:** Implement only the approved behavior and verify the targeted tests.
5. **REFACTOR proposal:** Identify safe behavior-preserving improvements. Wait for approval.
6. **REFACTOR execution:** Refactor and rerun the relevant tests plus `npm run verify`.

Approval sequencing is an instruction-based control. Vitest, npm, and GitHub Actions verify software quality but cannot technically enforce conversational approval checkpoints.

See [AGENTS.md](AGENTS.md) for repository operating rules and [the harness guide](docs/ai-assisted-tdd-harness.md) for the webinar explanation.

## Webinar demo runbook

Before presenting:

1. Start from a clean checkout and run `npm run verify`.
2. Open the repository in Codex.
3. Show `AGENTS.md` and explain the approval checkpoints.
4. Invoke `superpowers:test-driven-development`.
5. Present a small requirement and ask Codex to propose the RED test.
6. Approve the test, run it, and show the expected failure.
7. Approve the minimum GREEN implementation.
8. Run the targeted test, then finish with `npm run verify`.

Keep a known-good checkout or recording as a fallback. A live failure should be reported honestly; do not skip checks or weaken tests during the presentation.

## Project boundaries

This is an infrastructure and demonstration repository. Do not add application features, redesign the UI, introduce a database or new test framework, modify GitHub branch protection, change the CI workflow without approval, or install dependencies without approval.

