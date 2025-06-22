# Pinia Store Structure: Controlling External Exposure

This document addresses the challenge of controlling the external exposure of actions and getters within Pinia stores, aiming for better encapsulation and reduced error proneness. By default, anything defined in a Pinia store is publicly accessible. This can lead to accidental misuse of internal helpers, an increased public API surface, and reduced readability.

---

## 1. Professional Adjustments for Encapsulation in Pinia

To achieve better encapsulation in Pinia stores, especially when using the Composition API syntax within `defineStore`, consider the following strategies:

### A. Using the Composition API within `defineStore` for Encapsulation (Highly Recommended for True Privacy)

**Concept:** When defining a store using the Composition API setup function (i.e., `defineStore('id', () => { /* setup function */ })`), you can leverage JavaScript's module scope to control what is exposed. Anything declared *inside* the setup function but *not returned* in its final object will be private to that store instance.

**Solution:**
```typescript
// stores/myEncapsulatedStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; // Or other Vue reactivity APIs

export const useMyEncapsulatedStore = defineStore('myEncapsulatedStore', () => {
  // --- Private State & Methods ---
  const _privateState = ref(0); // This state is internal
  const _helperValue = computed(() => _privateState.value * 2);

  function _privateHelperAction(value: number) {
    // This action is only callable from within the store
    console.log("Running private helper action:", value);
    _privateState.value += value;
  }

  // --- Public State & Methods (Returned from setup) ---
  const publicData = ref('initial public data');
  const publicGetter = computed(() => `Public: ${publicData.value}, Private Calc: ${_helperValue.value}`);

  function performComplexAction(input: number) {
    // This public action orchestrates private and public methods
    console.log("Performing complex public action with input:", input);
    _privateHelperAction(input); // Calls the private helper
    publicData.value = `Updated by ${input}`;
  }

  function resetStore() {
    _privateState.value = 0;
    publicData.value = 'initial public data';
  }

  // Explicitly return only what you want to expose
  return {
    // Public state
    publicData,
    // Public getters
    publicGetter,
    // Public actions
    performComplexAction,
    resetStore,
  };
});
````

**Advantages:**

  * **True Encapsulation:** Variables and functions not returned from the setup function are genuinely private and inaccessible from outside the store instance.
  * **Co-location:** Related private and public logic can live together in the same store file, enhancing readability for maintainers of that specific store.
  * **TypeScript Enforcement:** TypeScript will prevent accidental access to private members from consumers of the store.

**Considerations:**

  * For very simple stores, it can be slightly more verbose than the Options API.
  * Extremely complex internal logic might still benefit from being extracted into separate, plain utility functions (see next point) to keep the store file manageable.

### B. Extract Internal Logic to Separate Utilities/Composables (Also Highly Recommended)

**Concept:** If a piece of logic (an action's implementation detail, a complex calculation for a getter) doesn't strictly need direct, reactive access to the store's state, it's often best placed outside the store definition entirely.

**Solution:** Create plain TypeScript utility functions or separate Vue composables. Your Pinia store's public actions then *call* these external utilities. These utilities are simply imported into the store file and are not part of the store's public API.

**Example:**

```typescript
// utils/calculationHelpers.ts
export function calculateComplexValue(param1: number, param2: number): number {
  // ... complex, pure calculation logic
  return param1 + param2 * 10;
}

// stores/myStore.ts
import { defineStore } from 'pinia';
import { calculateComplexValue } from '~/utils/calculationHelpers'; // Internal import

export const useMyStore = defineStore('my', {
  state: () => ({
    data: 0,
  }),
  actions: {
    // This action uses the helper but doesn't expose it
    updateData(val1: number, val2: number) {
      this.data = calculateComplexValue(val1, val2);
    },
    // The 'calculateComplexValue' function is not part of the store's public API
  },
  getters: {
    // ...
  }
});
```

**Advantages:**

  * **True Privacy:** The code resides entirely outside the store's public interface.
  * **Improved Testability:** Utilities and composables are easier to test in isolation as pure functions or self-contained logic units.
  * **Clearer Store Responsibility:** Stores remain focused purely on state management and orchestrating calls to external, well-defined logic.
  * **Reduced Store File Size:** Keeps your store definition cleaner and more focused.

### C. Naming Convention (`_` Prefix)

**Concept:** Use a leading underscore (`_`) for actions or getters intended for internal use only, particularly if you are using the Options API style for your store, or if extraction (Methods A or B) is impractical.

**Solution:** Define internal methods as `_internalAction()`, `_getHelperValue()`.

**Advantages:** Simple to implement and provides a clear visual signal to other developers that the method is for internal consumption.

**Drawbacks:** This is a convention, not enforced by TypeScript or the runtime. Other developers *can* still call these methods, but the underscore indicates "handle with care; this is an internal detail." This method is less preferred than A or B for strict privacy.

-----

## 2\. Overall Recommendation for Pinia Stores

For most professional projects, a robust and balanced approach to Pinia store encapsulation involves:

1.  **Prioritizing the Composition API setup within `defineStore` (Method A)** to create truly private state, getters, and actions by explicitly returning only the public API. This is the **preferred method for genuine encapsulation** of logic that needs to live within the store.
2.  **Supplementing with external utility functions or composables (Method B)** for complex, reusable logic that doesn't strictly need access to the store's internal reactive state, thereby keeping the store definition lean and focused on state management.
3.  **Using the `_` prefix convention (Method C)** only as a last resort, for simpler internal helpers within Options API stores, or where Methods A and B are not feasible.

This combined strategy effectively balances achieving strong encapsulation with maintaining Pinia's flexibility and developer experience.
