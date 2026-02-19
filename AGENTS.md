# AGENTS.md

## Project Overview

OpenCode plugin that translates non-English user input to English before it reaches the AI model.
Small, focused TypeScript library — 5 source files in `src/`, runtime is Bun, published to npm.

## Build / Lint / Test Commands

```bash
# Lint + format check (Biome)
bun run check

# Lint + format auto-fix
bun run check:fix

# Type-check only (no emit)
bun run typecheck

# Build (bundle + declarations)
bun run build

# Run all tests
bun test

# Run a single test file
bun test src/detector.test.ts

# Run tests matching a name pattern
bun test --test-name-pattern "English text"
```

All CI-relevant checks: `bun run check && bun run typecheck && bun test`

## Project Structure

```
src/
  index.ts          # Plugin entry point, wires hooks together
  detector.ts       # isEnglish() — Unicode code-point heuristic
  extractor.ts      # extractCodeBlocks / restoreCodeBlocks
  translator.ts     # translateToEnglish() — calls OpenAI-compatible API
  types.ts          # Shared interfaces (TranslatorConfig, CodeBlock, TranslationResult)
  *.test.ts         # Co-located tests (same directory as source)
```

## Code Style

### Formatter & Linter

Biome handles both formatting and linting. Config lives in `biome.json`.

- Indent: 2 spaces
- Quotes: single quotes (`'`)
- Semicolons: always (Biome default)
- Trailing commas: all (Biome default)
- Line width: 80 (Biome default)
- Import organization: automatic via `organizeImports: "on"`
- Unused imports: error

Run `bun run check:fix` to auto-fix. Never configure ESLint or Prettier — this project uses Biome exclusively.

### TypeScript

- Strict mode enabled (`"strict": true`)
- `noUncheckedIndexedAccess: true` — indexed access returns `T | undefined`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `allowImportingTsExtensions: true` — always include `.ts` extension in relative imports
- `noEmit: true` — TypeScript is only used for type-checking; Bun handles bundling
- Target: ESNext, module: Preserve, moduleResolution: bundler

### Imports

```typescript
// Type-only imports MUST use `import type` (enforced by verbatimModuleSyntax)
import type { TranslatorConfig } from './types.ts';

// Value imports
import { isEnglish } from './detector.ts';

// Always use .ts extension for relative imports
import { extractCodeBlocks } from './extractor.ts';  // ✓
import { extractCodeBlocks } from './extractor';      // ✗
```

Biome auto-organizes imports. Do not manually sort.

### Naming Conventions

- Files: `kebab-case.ts` (e.g. `detector.ts`, `extractor.ts`)
- Functions: `camelCase` — exported functions are named, not arrow
- Interfaces/Types: `PascalCase` (e.g. `TranslatorConfig`, `CodeBlock`)
- Constants: `PascalCase` for exported plugin instances, `camelCase` for local
- Test files: `<module>.test.ts`, co-located next to source

### Error Handling

This project uses a fail-open pattern — translation failures must never block the user:

```typescript
// Pattern: try the operation, return graceful fallback on any error
try {
  // attempt translation
  return { translated: true, text: translatedText };
} catch (err) {
  console.warn('[functionName] error:', err);
  return { translated: false, text: originalText };
}
```

- Never throw from public API functions — always return a result object
- Use `console.warn` for non-fatal issues (not `console.error`)
- Timeouts: use `AbortSignal.timeout()` for fetch calls

### Testing

- Test runner: `bun:test` (built into Bun)
- Imports: `import { describe, expect, test } from 'bun:test'`
- Test style: `describe` block per module/function, `test` (not `it`) for cases
- Test names: descriptive with arrow notation for expected results (e.g. `'Korean text → false'`)
- HTTP mocking: use `Bun.serve({ port: 0 })` for local test servers, clean up in `afterAll`
- No external test libraries — only `bun:test`

### Type Strictness

NEVER use `any` or type assertions (`as X`). This is the #1 rule.

- No `@ts-ignore`, `@ts-expect-error`, or `as unknown as X` workarounds
- Root tsconfig: `"strict": true`, `"verbatimModuleSyntax": true`, `"isolatedModules": true`
- Use `unknown` + type guards (narrowing functions) instead of `any`
- Prefer `interface` for object shapes (not `type` aliases for objects)
- Use non-null assertion (`!`) sparingly and only when the value is guaranteed (e.g. `codePointAt(0)!` inside a `for..of` loop)

### Module Pattern

- Each module exports pure functions — no classes, no singletons
- Plugin entry point (`index.ts`) exports a named `Plugin` factory and a default export
- Types live in `types.ts` — shared interfaces only, no logic
- Keep modules small and single-purpose

## Dependencies

- Runtime: Bun
- Peer deps: `typescript ^5`, `@opencode-ai/plugin >=1.0.0`
- Dev deps: `@biomejs/biome`, `@opencode-ai/plugin`, `@types/bun`
- No production dependencies — only `fetch` (global) is used for HTTP

## Publishing

```bash
bun run build        # runs automatically via prepublishOnly
npm publish
```

Output goes to `dist/` (ESM bundle + `.d.ts` declarations). Only `dist/` is included in the package.
