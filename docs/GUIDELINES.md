# GUIDELINES

## Purpose

Shared coding conventions for this ESLint plugin package.

## Language and runtime

- TypeScript + ESM (`"type": "module"`, `moduleResolution: "NodeNext"`).

## Imports

- Use explicit `.js` extension for local TypeScript imports.
- Keep external imports before local imports.
- Respect package import boundaries from `AGENTS.md`.

## Formatting

- 4-space indentation.
- Single quotes.
- Semicolons required.
- Break long lines without hiding structure.
- Avoid long method chains when a named intermediate improves readability.

## Code style

- Prefer `for .. of` over `.forEach`.
- Do not use `.reduce` for imperative loops.
- Prefer `const`; only use `let` when reassignment is truly needed.
- Extract focused methods/functions instead of growing large blocks.
- Do not add blank lines in methods; this is a code smell which is used instead of adding meaningful comments or breaking down methods into smaller digestible single-responsibility chunks.

## Typing and APIs

- Preserve strict typing; do not weaken types without strong reason.
- Avoid `any`; use it only when no typed integration path exists.

## Design

- Keep side effects at startup/boundary paths.
- Keep rule logic deterministic and easy to test.

## Linting

- Respect project ESLint configuration.
- Keep dependency usage explicit and minimal.

## Documentation style

- Keep wording direct and concrete.
- Use one blank line between logical blocks.
- Remove filler words from headings and bullets.
