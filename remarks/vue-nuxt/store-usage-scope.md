# Store (State Management) Usage Scope (Vue.js & Nuxt.js)

**Guideline:** Restrict the use of your state management store (e.g., Pinia, Vuex) primarily for:

* **Global Application State:** Information that is truly application-wide and needs to be accessible by multiple, disparate components (e.g., user authentication status, global loading indicators, feature flags).
* **Session-Persistent Data:** Information that needs to be maintained across the user's session (e.g., `currentUser`, `jwtToken`, `currentTheme`).
* **Cached Reference Data:** Data that is fetched once and rarely changes, used by many parts of the application (e.g., list of countries, product categories).

**Explanation:**

This disciplined approach prevents stores from becoming "god objects" that encapsulate too much logic and state. It encourages developers to:

* **Prefer Local State:** Utilize component-level reactive state (`ref`, `reactive`) for data that is only relevant to a specific component or its immediate children.
* **Leverage Composables:** Use composables for reusable logic and localized state that can be encapsulated and reused across multiple components without polluting the global store.
* **Improve Performance:** Minimizing global reactive state can reduce reactivity overhead and make debugging easier by narrowing down the sources of state changes.