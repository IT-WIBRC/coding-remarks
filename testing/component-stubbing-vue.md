# Component Stubbing in Vue Tests

**Guideline:** When stubbing Vue components in your tests (e.g., with Vue Test Utils), always refer to the component by its **registered component name** in the `global.stubs` (or local `stubs`) option.

**Explanation:**

Vue identifies components by their registered name within the application's component tree. This name is typically:

- The value of the `name` option in `defineComponent({ name: 'MyComponent', ... })`.
- In `<script setup>`, it's automatically inferred from the filename (e.g., `MyComponent.vue` implies a name of `'MyComponent'`).
- The name used during global registration (`app.component('MyGlobalComponent', MyGlobalComponent)`).

**Common Pitfall:** Do **NOT** use the name you give a component when you import it (e.g., `import MyAlias from './MyComponent.vue';`). The alias is only relevant within that specific file; Vue's rendering engine doesn't know the component by that alias.

**Example (Vue Test Utils):**

```typescript
// MyComponent.vue
<script setup lang="ts">
// This component's registered name will be 'MyComponent'
</script>
<template><div>My Component</div></template>

// MyParentComponent.vue (using MyComponent)
<script setup lang="ts">
import MyComponent from './MyComponent.vue';
</script>
<template><MyComponent /></template>

// MyParentComponent.spec.ts (testing MyParentComponent)
import { mount } from '@vue/test-utils';
import MyParentComponent from './MyParentComponent.vue';

describe('MyParentComponent', () => {
  it('renders correctly with MyComponent stubbed', () => {
    const wrapper = mount(MyParentComponent, {
      global: {
        stubs: {
          // Correct: refer to it by its registered name 'MyComponent'
          MyComponent: true, // Stubs the component with a minimal placeholder
          // Incorrect:
          // MyAlias: true, // If you did `import MyAlias from './MyComponent.vue'`
        },
      },
    });
    expect(wrapper.html()).toContain('<mycomponent-stub>'); // The default stub output
  });
});
```
