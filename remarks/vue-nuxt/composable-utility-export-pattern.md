# Composable/Utility Function Export Pattern (Vue.js & Nuxt.js)

**Guideline:** For most composables and utility functions (i.e., `.js` or `.ts` files that export functions), prefer declaring all functions at the top level and exporting them within an object (or as named exports if a single function is the primary export).

**Explanation:**

This approach enhances **testability** and **clarity**. When functions are declared and exported as properties of an object (or as named exports), they provide clear, explicit entry points for testing and mocking dependencies. This avoids the complexities that can arise with closures, especially when they encapsulate internal state that is hard to reset or mock in tests.

**Example (Preferred):**

```typescript
// useMyUtility.ts
import { ref } from "vue"; // Example import if using reactivity

const internalState = ref(0); // If truly module-level shared state is intended

export const myFunctionA = () => {
  /* ... */
};
export const myFunctionB = () => {
  /* ... */
};

// If you need to return a cohesive API, an object is good:
export const useMyUtility = () => {
  // Access internalState or other functions
  return { myFunctionA, myFunctionB };
};
```

**_Note on Stateful Composables_**: If a composable must manage isolated internal state for each invocation (e.g., `useCounter()` where each counter should be independent), then the closure pattern `(const useCounter = () => { const count = ref(0); return { count }; })` is appropriate. In such cases, the returned API (the object from the closure) is the unit that should be tested. This guideline primarily targets utilities that are intended to be stateless or share module-level state.
