# Code Organization & Architecture Standards

Mandatory guardrails for AI-generated and refactored code.

> [!IMPORTANT] Scope of Impact (Zero Unsolicited Changes)
> Apply these rules **ONLY** to:
> 1. **Newly created** files and modules.
> 2. Existing modules/files **explicitly targeted** by the current task.
> Do **NOT** refactor unrelated working code. Keep the blast radius minimal.

---

## 1. Feature-First & Monorepo Boundaries

Organize code by **business domain/feature**, not by technical layer at the root.

- **Monorepo Packages (`packages/*`):** Cross-app contracts (`packages/types`), database/repositories (`packages/repositories`), and shared primitives live in dedicated packages. Never duplicate DTOs or schemas inside `apps/*`.
- **Feature Colocation:** Keep a feature's schema, service logic, UI components, and unit tests (`*.test.ts`) together inside its feature folder.
- **Rule of Two (`shared/`):** Only move a utility, hook, or component to `shared/` when **at least 2 distinct features** actively reuse it. Otherwise, keep it colocated.

---

## 2. Dependency Direction & Public Boundaries

Enforce a strict one-way dependency graph to prevent circular imports and spaghetti coupling:

- **Unidirectional Flow:** `apps (routes/UI)` → `features/domain services` → `packages/repositories` → `packages/types`.
- **No Upward/Cross-Feature Imports:** `shared/` must never import from `features/`. Feature A must never deep-import internal files of Feature B.
- **Pragmatic Public API (`index.ts`):** Expose public surfaces via `index.ts` (or `package.json` `exports`) **only at package or top-level domain boundaries**. Avoid nested barrel files inside sub-folders to preserve tree-shaking and prevent circular dependencies.

---

## 3. Cohesion Over Arbitrary Line Limits

Optimize for **readability and linear control flow**, not artificial line counts.

- **Flat Control Flow:** Prefer `early returns`, guard clauses, and shallow nesting (**max 2–3 levels**).
- **Split by Responsibility, Not Line Count:** A cohesive 300-line file is better than three fragmented 100-line files. Split a file or function only when:
  1. It mixes distinct responsibilities (e.g., network fetching + complex state + heavy layout).
  2. A pure calculation or sub-flow can be isolated for independent unit testing.
  3. Nesting or branching becomes hard to scan at a glance.
- **No Premature Abstraction (Rule of Three):** Do not introduce Factory, Strategy, Adapter, or generic wrappers until the **3rd** concrete variation appears. Duplication is cheaper than the wrong abstraction.

---

## 4. Naming & Hygiene

- **Files & Folders:**
  - Feature folders & logic files: `kebab-case` (`order-fulfillment/`, `pricing.service.ts`, `pricing.service.test.ts`).
  - React components: `PascalCase.tsx` (`OrderSummary.tsx`).
- **Identifiers:** `camelCase` for variables/functions; boolean prefixes (`isReady`, `hasAccess`, `shouldRetry`); event handlers prefixed with `handle` (`handleSubmit`). Types/Interfaces use `PascalCase` without `I` prefix.
- **Delete-First Hygiene:** Remove dead code, unused imports, and obsolete branches immediately. Never leave commented-out code "just in case".

---

## 5. Documentation: WHY, Not WHAT

Do not write JSDoc/comments that merely restate the function name or parameter types.

- ❌ **Bad (WHAT):** `// Calculate total price`
- ✅ **Good (WHY & Constraints):**
  ```ts
  /**
   * Applies VAT after voucher deduction per Oct 2026 accounting rules.
   * Uses Math.floor to match VNPay gateway rounding requirements.
   */
  function calculateTotal(items: CartItem[]): CurrencyAmount {}
  ```
