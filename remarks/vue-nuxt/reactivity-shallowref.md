# Reactivity with `shallowRef` Considerations (Vue.js & Nuxt.js)

**Guideline:** Avoid using `shallowRef` for general application state within `defineComponent` (or `<script setup>`) unless you have a specific, well-understood performance optimization in mind. Prefer `ref` for most cases.

**Explanation:**

- **`ref` (Deep Reactivity - Default):** When you use `ref({ key: 'value' })`, Vue creates a "deeply reactive" object. Changes to `ref.value` _or_ any nested properties (`ref.value.key = 'new_value'`) will trigger template updates. This is the intuitive and expected behavior for most state.
- **`shallowRef` (Shallow Reactivity):** When you use `shallowRef({ key: 'value' })`, Vue only tracks changes if you **reassign the entire `.value` property** (`shallowRef.value = { anotherKey: 'another_value' }`). Changes to nested properties (`shallowRef.value.key = 'new_value'`) **will NOT trigger updates**.

**Why avoid `shallowRef` by default?**
Using `shallowRef` when deep reactivity is expected can lead to hard-to-debug issues where your data changes but the UI doesn't update. It's a tool for advanced performance optimization when you explicitly know you will only be replacing the entire object/array inside the ref, or when you are wrapping an external library's object that manages its own reactivity. For general component state, `ref` provides the more robust and predictable behavior.
