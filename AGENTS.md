## Purpose

`@inca/eslint-no-blank-lines-in-blocks` provides a focused ESLint plugin rule that disallows blank lines inside block bodies for methods and functions.

- Publish a reusable plugin package for teams that enforce compact, single-responsibility method/function bodies.
- Keep the package small, strict, and TypeScript-first.

## Allowed imports

Import topology for this repository:

- `src/rules/*` -> `eslint` (types only) and local utilities.
- `src/index.ts` -> `src/rules/*`.
- Documentation files -> no runtime imports.

## Package rules

- Keep this package single-purpose: one plugin, one rule family.
- Rule logic must avoid auto-fixing unless behavior is proven safe.
- Keep runtime dependencies minimal; prefer peer dependencies for host tooling (`eslint`).
- Preserve ESM and strict TypeScript settings.

## References

- `README.md`
- `docs/CODING_GUIDELINES.md`
- `package.json`

## Change checklist

- Rule behavior is consistent for methods and function blocks.
- `docs/CODING_GUIDELINES.md` conventions are followed.
- `npm run compile` succeeds.
- Package entrypoints (`main`, `types`, `exports`) still point to build output.

## Commit message rules

- Use Conventional Commits for every commit message.
- Format: `type: short summary (lowercased, no dot at the end)`.
- Allowed types: `chore`, `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `build`.
- Prefer `chore` for uncategorized changes.
