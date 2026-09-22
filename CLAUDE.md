# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Work is not complete until the relevant app's build/lint passes without errors.** Run it before considering any task done.

Before starting a dev server to test something, check whether one is already running (e.g. `lsof -i :5173`). If it's already up, use that instance instead of starting another. Only stop a dev server at the end of testing if you were the one who started it.

## Development Rules

### Styling

Always use Tailwind utility classes instead of hardcoded CSS values (colors, spacing, font sizes, etc.) — never write inline `style={{ ... }}` or one-off CSS with literal hex codes, pixel values, or magic numbers. Reach for a Tailwind class (or a token from `src/theme.css` — see below) first, and only drop into `@layer base`/`@layer components` CSS for things Tailwind genuinely can't express.

**Theming:** Design tokens live in `apps/web/src/theme.css` as CSS variables (each set with `light-dark(light-value, dark-value)`), mapped into Tailwind's `@theme inline` so they're usable as ordinary utility classes (`bg-bg`, `text-fg`, `text-fg-muted`, `bg-surface`, `border-border`, `bg-accent`, `text-accent-fg`, `font-heading`). There is no in-app light/dark toggle on web or mobile — both follow the device's own OS appearance setting only. Never hardcode a color that should come from the active theme — use the token classes so light and dark both stay correct automatically.

### DRY

Don't duplicate logic 

### Keep components small

Components should do one thing. If a component's file is growing to handle multiple concerns (data fetching, layout, business logic, multiple sub-views), split it. Prefer several small, well-named components over one large one.

### No premature abstraction

Don't build shared abstractions, config layers, or generic utilities speculatively. Three similar lines is better than a premature abstraction. Wait until a real second or third use case exists.

### Error handling

Nothing is allowed to fail silently. Every error must be surfaced — either in the UI (as a visible, copyable error message) or in the console/log with enough context to debug it. Never swallow an error in an empty `catch` block.

### Test-driven workflow

For bug fixes and non-trivial features:

1. Write a test that **fails** against the current code, demonstrating the bug or the missing behavior.
2. Implement the fix or feature.
3. Confirm all tests pass.
4. Confirm the app builds/lints cleanly.

Work is not complete until both the tests and the build are green.

### TODO.md

`TODO.md` (repo root) is the single source of truth for planned work. Add an entry for every bug, feature, enhancement, or upgrade as soon as it's identified — before writing code. Remove an item once its work is committed; don't leave it checked off — git history is the record.

### Versioning

Bump the `version` field in the relevant app's `package.json` (and root `package.json` if the change is repo-wide) for any commit that changes actual code. Commits that touch only documentation (`CLAUDE.md`, `TODO.md`, `README.md`) are excluded.
