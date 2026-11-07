# Project Guidance and Skills Refactoring Implementation Plan

> **For agentic workers:** Execute this plan inline. Use `superpowers:executing-plans` when available; read the design before editing. Review the complete change with a fresh reviewer.

**Goal:** Deliver repository guidance and local skills alongside a behavior-preserving refactor of the portfolio skills section.

**Architecture:** Retain existing component/data directories. Extract feature state, modal lifecycle and reusable presentation with explicit variants and owned scoped styles. Keep project-wide conventions in AGENTS.md and conditional workflows in discoverable skills.

**Tech Stack:** Vue 3, TypeScript, SCSS, Node native test runner, existing lint/build tools.

**Spec:** `docs/superpowers/specs/2026-11-06-project-guidance-design.md`

## Global Constraints

- Preserve appearance, bilingual content, carousel calculations and interactions.
- Do not add dependencies or manually edit generated JSON.
- No commit, push or publication; retain unrelated user files.
- Install and validate `.agents/skills` directly in the project; the current session permits filesystem writes.

## Review Focus

- Scoped styles must reach extracted descendants, including card hover effects.
- Card technology tags must retain click propagation behavior.
- Modal opening, closing and unmounting must restore focus and prior scroll styles.
- Empty filters, selection reset and locale changes must remain coherent.
- Guidance must describe actual commands and route to existing, discoverable files.

## Tasks

1. [x] Record baseline build/lint and evaluate realistic maintenance scenarios against raw repository files.
2. [x] Add meaningful behavioral tests for extracted state; implement `useSkillsShowcase` and connect the section.
3. [x] Extract media, technology list, snippet, link icon mapping and modal lifecycle, moving owned CSS and responsive rules with the markup.
4. [x] Author and validate each local skill; add AGENTS.md files and repair stale content documentation.
5. [x] Run regression checks and independent code/instruction review of the installed skills and implementation.

## Execution record

- Baseline `npm run build`: passed. Scoped ESLint and Oxlint: passed.
- Read-only maintenance evaluation correctly located the data pipeline and CSS boundaries; identified outdated metadata documentation and lack of a test command. Treat skills as concise operational references, not discipline policies.
- User explicitly requested both deliverables and execution of the prior incremental proposal; continue within this scope without an additional design approval loop.
- Current session resumed the existing extraction and tests in place, preserving unrelated user files; no worktree or commit was created.
- Baseline repeated successfully: build, Oxlint, ESLint, 4 state tests and browser focus/Escape/mobile checks over Python, TypeScript, Google Cloud and Airflow.
- Independent maintenance scenario pass identified outdated docs, scoped CSS boundaries, read-only lint commands and unsupported experience images; local skills address these concrete gaps.
- Vue/content skills passed independent application checks; manifests validated with the skill-creator validator using temporary `uv` tooling (no application dependency added).
- Added regression tests for live locale updates and empty-list closure: both failed against the initial composable and passed after deriving selection by key. Snippet tests failed before extraction and passed after single-pass tokenization.
- Browser comparison matched baseline media, stack and card styles; snippet/code/terminal heights intentionally differ where the previous tokenizer corrupted markup. Other captured properties remain equal.
- Final checks passed: `npm run lint:check`, `npm run build` (including application and test type-check), `npm test` (11/11), `git diff --check`. Generated JSON files remained unchanged in Git.
- All three skills passed the skill-creator validator. Their UI manifests parsed correctly, default prompts reference their skill, and 35 local Markdown links resolved. The verification skill also passed an independent read-only application scenario.
- Independent final review found no Critical, Important or Minor corrections. Its browser/build limitations were covered by the primary agent's checks.
- Chromium checks passed for real tag clicks, Tab/Shift+Tab, Escape, overlay close, live EN/PT switch with a selected experience, exact snippet source text, preserved scroll/padding priorities, initially closed modal, unmount and rapid close. Hover on a parent card still scales its image. Desktop/mobile screenshots were inspected at 1440px/390px, with reduced motion and no horizontal page overflow or runtime exceptions.
- Browser instrumentation and Python validator dependencies were temporary, outside the repository. No application dependencies, commits, pushes or publications were added.
