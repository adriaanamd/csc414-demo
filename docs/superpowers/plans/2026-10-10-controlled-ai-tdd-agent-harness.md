# Controlled AI-Assisted TDD Agent Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight, documented AI-assisted TDD harness that guides human-approved Red–Green–Refactor work while reusing the repository’s existing Vitest, TypeScript, Vite, and GitHub Actions gates.

**Architecture:** Repository behavior remains unchanged. `AGENTS.md` defines the local operating contract, `docs/ai-assisted-tdd-harness.md` explains the webinar workflow, and one aggregate npm script composes the existing verification commands. The external `superpowers:test-driven-development` skill remains the authoritative TDD procedure and is referenced explicitly rather than copied or replaced.

**Tech Stack:** TypeScript, React, Vite, Vitest 5, npm lockfile, GitHub Actions, Codex repository instructions.

## Global Constraints

- No new application features or UI redesign.
- No new dependencies, framework installation, database, service, deployment, commit, or push.
- Do not modify `.github/workflows/ci.yml` or global Codex settings.
- Reuse the existing `superpowers:test-driven-development` skill.
- Keep human approval checkpoints instruction-based and clearly distinguish them from CI-enforced checks.
- Use Node 22 as the documented CI-compatible runtime target.

---

### Task 1: Add repository operating instructions

**Files:**
- Create: `AGENTS.md`

**Interfaces:**
- Consumes: Existing project scripts, CI workflow, and `superpowers:test-driven-development` skill.
- Produces: Repository instructions that Codex can discover before future work.

- [x] **Step 1: Write the repository contract**

  Document the project purpose, architecture, allowed and prohibited operations, human approval gates for RED/GREEN/REFACTOR, required verification commands, scope control, error reporting, security restrictions, and explicit skill invocation.

- [x] **Step 2: Verify the instructions reference existing capabilities**

  Confirm every command named in `AGENTS.md` exists in `package.json`, and confirm no instruction claims approval sequencing is technically enforced.

### Task 2: Add the aggregate verification command

**Files:**
- Modify: `package.json` scripts section
- Modify: `package-lock.json` only if npm changes it

**Interfaces:**
- Consumes: `npm run typecheck`, `npm run test:unit`, `npm run test:ui`, `npm run test:e2e`, and `npm run build`.
- Produces: `npm run verify`, a sequential local quality gate matching the CI checks.

- [x] **Step 1: Add the script**

  Add `"verify": "npm run typecheck && npm run test:unit && npm run test:ui && npm run test:e2e && npm run build"` without changing existing scripts or dependencies.

- [x] **Step 2: Validate command forwarding**

  Run `npm run verify` and confirm it executes typecheck, all three test lanes, and the production build in order.

### Task 3: Document the webinar harness workflow

**Files:**
- Create: `docs/ai-assisted-tdd-harness.md`

**Interfaces:**
- Consumes: `AGENTS.md`, existing TDD skill, package scripts, and CI workflow.
- Produces: Concise operator documentation for a reproducible human-in-the-loop TDD session.

- [x] **Step 1: Document invocation and phases**

  Explain how to invoke `superpowers:test-driven-development`, then document RED, GREEN, and REFACTOR approval checkpoints, expected evidence, and recovery from failed changes.

- [x] **Step 2: Document verification and limitations**

  List `npm run verify` and the individual CI-equivalent commands, explain instruction-based versus technically enforced controls, identify the Node 22 CI target, and state that CI does not enforce human approval sequencing.

### Task 4: Validate the harness without changing application behavior

**Files:**
- Temporary isolated fixture under `tests/.harness-fixture/`, removed after validation

**Interfaces:**
- Consumes: Vitest configuration and the documented TDD procedure.
- Produces: Fresh evidence that an isolated RED test fails for the expected missing behavior and that the normal verification gate remains green afterward.

- [x] **Step 1: Create a temporary RED fixture**

  Add a test-only fixture that asserts a deliberately absent local function or behavior and run it directly with Vitest. Confirm the failure is an expected assertion or missing implementation failure, not a configuration error.

- [x] **Step 2: Remove the temporary fixture**

  Delete only the temporary fixture created for this validation and confirm production source and test suites are unchanged.

- [x] **Step 3: Run final verification**

  Run `npm run verify`, inspect `git diff`, and confirm `.github/workflows/ci.yml` and application source behavior were not intentionally modified.
