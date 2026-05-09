# Project conventions for Claude Code

This repo is a Next.js (pages router) FSBO Texas guide. Components live in `components/`, page entries in `pages/`, and shared utilities in `utils/`.

When the user asks for a code change, follow the **Clean Replacement Only** protocol below. Reference it by name when announcing what you're about to do (e.g. "Applying the Clean Replacement protocol — this is a JSX-only edit, no split needed.").

---

# Protocol: Clean Replacement Only

## Rule 1 — No "Old Code" Backups
Overwrite the file entirely. Do not leave previous code commented out at the bottom of the file, in a `// removed` block, or in a renamed `*.old` companion file. The file after the change should look like it would have if the new code had been written from scratch.

## Rule 2 — No Redundancy
Delete original logic as you replace it. Do not keep a now-unused helper, state variable, import, or branch "just in case." If a function or variable is no longer referenced after the change, remove it in the same edit.

## Rule 3 — Manage Timeouts
Split into Step A (State / Logic) and Step B (JSX) **only when the change is substantive** — not for every file over 500 lines.

Trigger a split when **any** of the following is true:
- The change touches more than ~50 lines of code, OR
- The change adds new state, hooks, effects, or handlers AND new JSX in the same pass, OR
- The replacement spans more than one logical section of the file (e.g. both the form logic and the list rendering).

Do **not** split for:
- Single-line or few-line edits
- JSX-only edits with no state/logic change
- Small state/logic-only edits with no JSX change
- Renames, sort flips, color/copy tweaks

When a split is required:
- **Step A** must include any new imports, constants, state, hooks, and handlers — everything Step B will reference.
- **Step B** must be strictly UI layout that consumes what Step A defined; no new state or logic.
- If a change is large but pure state/logic with no UI change, run **Step A only** (there is no Step B to run).

## Rule 4 — Verify via Linting
Linting must be **real lint**, not a build. If the project has no working `npm run lint` script:

1. Set up ESLint as a one-time prerequisite before applying the protocol:
   - For Next.js: `npx next lint` and accept the **Strict** config; this writes `.eslintrc.json` and adds `eslint` + `eslint-config-next` as devDependencies.
   - Add a `"lint": "next lint"` script to `package.json`.
2. After every replacement, run `npm run lint` and confirm no new errors or warnings were introduced. Fix anything the lint surfaces before reporting the task done.
3. A `next build` is acceptable as an **additional** check (it catches type/JSX errors at compile time) but does **not** substitute for lint.

## Rule 5 — Be Honest About Compliance
At the end of any task that touches this protocol, state plainly which rules were followed and which were skipped (and why). Do not silently downgrade a rule.

---

## Quick reference (cheat sheet)
| Situation | Split? | Verify with |
|---|---|---|
| 1–10 line edit, JSX only | No | `npm run lint` |
| Small state/logic only (no JSX) | No | `npm run lint` |
| Sort flip, color tweak, copy change | No | `npm run lint` |
| New state + new JSX, large refactor | Yes (Step A then Step B) | `npm run lint` |
| File rewrite > ~50 lines changed | Yes (Step A then Step B; Step A only if no UI change) | `npm run lint` |
| Project has no `lint` script yet | — | Set up ESLint first |

---

## Expected workflow per request

**Before editing:** Announce which cheat-sheet row applies and whether a split is needed.

**After editing:** Produce a **Protocol compliance report**: list each rule, state followed/skipped with reason, and paste the `npm run lint` output (or note if lint is not yet set up and recommend setting it up).
