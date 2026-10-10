# Controlled AI-Assisted TDD Harness

This repository uses a lightweight, human-in-the-loop harness for demonstrating AI-assisted Test-Driven Development. It adds repository instructions and one repeatable verification command while preserving the application, test framework, dependency set, and GitHub Actions workflow.

## Components

- `AGENTS.md` is the repository operating contract discovered by Codex. It defines scope, security, approval checkpoints, and verification expectations.
- `superpowers:test-driven-development` is the existing TDD skill. It remains authoritative for the Red–Green–Refactor procedure and is not replaced by this repository documentation.
- `npm run verify` composes the existing typecheck, unit, UI, E2E, and production build scripts.
- `.github/workflows/ci.yml` remains the remote quality gate and keeps separate, visible typecheck, test, and build jobs.

## Starting a TDD session

Before changing code, invoke the existing skill explicitly:

```text
Use superpowers:test-driven-development for this task.
```

Then follow this controlled sequence:

### RED

Read the requirement and acceptance criteria. Propose the smallest behavior-focused tests, their test files, and the command that will run them. Wait for developer approval. After approval, write the tests and run them. The failure must demonstrate missing or incorrect behavior, not a typo or configuration problem.

### GREEN

Propose the minimum implementation needed to satisfy the approved failing tests. Wait for developer approval. Implement only that behavior, run the targeted tests, and report the actual output. Run related regression checks when the change crosses test layers.

### REFACTOR

After green, identify only safe behavior-preserving improvements. Wait for approval before refactoring. Rerun the affected tests and then the full verification gate.

The agent must not move between these phases without the required developer approval. Approval sequencing is a documented process control, not a technically enforced property of Vitest, npm, Codex, or GitHub Actions.

## Verification

Run the full local gate with:

```bash
npm run verify
```

The command runs, in order:

```bash
npm run typecheck
npm run test:unit
npm run test:ui
npm run test:e2e
npm run build
```

For fast iteration, run the narrowest applicable command first. CI uses Node 22, `npm ci`, and the same underlying commands in separate jobs. The local aggregate command improves reproducibility but does not replace CI.

## Failure reporting and recovery

When a command fails, preserve the first meaningful error and report the exact command, exit code, affected lane, and whether the problem is code, test, configuration, or environment. Do not skip tests, weaken assertions, install unapproved dependencies, or claim success without fresh output.

If a change is wrong, return to the last approved phase, keep the failing test if it captures the requirement, and make the smallest corrective change. Inspect `git diff` and `git status` before cleanup. Temporary validation fixtures must be removed after use; unrelated user changes must remain untouched.

## Known limitations

The harness cannot technically prevent an agent or developer from editing files out of sequence. It provides discoverable instructions, explicit approval checkpoints, existing automated quality gates, and accurate reporting expectations. GitHub Actions verifies code quality after changes are pushed or proposed; it does not observe conversational approvals. No CI workflow or branch protection changes are required for this demonstration.
