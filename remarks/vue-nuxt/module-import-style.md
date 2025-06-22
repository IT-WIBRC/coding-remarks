# Module Import Style Guidelines (Vue.js & Nuxt.js)

**Guideline:** Wherever possible, use **named exports** and **named imports** (`import { myFunction } from '...'`) for utility functions, composables, and service modules (`.js` or `.ts` files).

**Explanation:**

- **Consistency:** Named exports enforce a single, canonical name for each exported entity. This makes it much easier to search the codebase, understand what a specific import refers to, and reduces cognitive load by eliminating ambiguity.
- **Refactoring Safety:** Renaming a named export is typically easier to refactor across a codebase with modern IDEs.

**Example (Preferred):**

```typescript
// myUtility.ts
export const formatCurrency = (amount: number) => {
  /* ... */
};

// someComponent.vue
import { formatCurrency } from "~/utils/myUtility";
```

**_Exception for Vue Single File Components (.vue files)_**
For Vue components defined in `.vue` files, it is generally recommended to use `export default defineComponent({ /* ... */ })`. This is the idiomatic and widely accepted pattern within the Vue ecosystem, and it clearly designates the primary component exported from that file. The component's name for debugging and testing purposes `(<MyComponent />)` is derived from its `name` option or its filename.
