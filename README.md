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

### Live approval markers

For the webinar, make the pauses visible. End each proposal with one of these markers and wait for the exact approval phrase:

```text
RED — awaiting approval       -> approve red
GREEN — awaiting approval     -> approve green
REFACTOR — awaiting approval  -> approve refactor
```

An ambiguous response is not approval. Ask the presenter which phase to continue. If a test or verification command fails, stay in the current phase and report the failure before proceeding.

See [AGENTS.md](AGENTS.md) for repository operating rules and [the harness guide](docs/ai-assisted-tdd-harness.md) for the webinar explanation.

## Webinar demo runbook

Before presenting:

1. Start from a clean checkout and run `npm run verify`.
2. Open the repository in Codex.
3. Show `AGENTS.md` and explain the approval checkpoints.
4. Invoke `superpowers:test-driven-development`.
5. Present a small requirement and ask Codex to propose the RED test.
6. Wait for `RED — awaiting approval`, then respond `approve red`.
7. Run the test and show the expected failure.
8. Ask Codex to propose the minimum GREEN implementation, wait for `GREEN — awaiting approval`, then respond `approve green`.
9. Run the targeted test and show the passing result.
10. If demonstrating refactoring, wait for `REFACTOR — awaiting approval`, respond `approve refactor`, and rerun the checks.
11. Finish with `npm run verify`.

Keep a known-good checkout or recording as a fallback. A live failure should be reported honestly; do not skip checks or weaken tests during the presentation.

## Project boundaries

This is an infrastructure and demonstration repository. Do not add application features, redesign the UI, introduce a database or new test framework, modify GitHub branch protection, change the CI workflow without approval, or install dependencies without approval.

