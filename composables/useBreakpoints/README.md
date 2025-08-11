### `useBreakpoints`

A composable function to easily and reactively check the current window's screen size based on predefined breakpoints.

---

#### The Problem

In modern web development, it's common to build responsive interfaces that change based on screen size. This often requires manually adding and removing `resize` event listeners and managing state, which can lead to repetitive and error-prone code.

---

#### Why Use This Instead of a Library?

While large utility libraries like `VueUse` are powerful, it's often inefficient to import a full library just to use one or two functions. This composable provides a lightweight, custom solution that avoids adding unnecessary dependencies to your project, giving you full control over the code and ensuring a smaller final bundle size.

---

#### Usage

Simply import the `useBreakpoints` composable from its file [useBreakpoints](`composables/useBreakpoints/index.ts`) into your Vue component and use the returned reactive properties to conditionally render or style your content.

Here is a basic example:

```vue
<template>
  <div>
    <h1>Current Breakpoint: {{ currentBreakpoint }}</h1>
    <p v-if="isMobile">You are viewing this on a mobile device!</p>
    <p v-else-if="isTablet">You are viewing this on a tablet.</p>
    <p v-else>You are viewing this on a desktop.</p>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "~/composables/useBreakpoints";

const { currentBreakpoint, isMobile, isTablet } = useBreakpoints();
</script>
```

---

#### Custom Breakpoints

You can also pass an optional object to the composable to define your own custom breakpoints. The composable will automatically sort them from largest to smallest.

```ts
import { useBreakpoints } from "~/composables/useBreakpoints";

// Define custom breakpoints for a different project
const customBreakpoints = {
  small: 480,
  medium: 800,
  large: 1100,
};

const { currentBreakpoint } = useBreakpoints(customBreakpoints);
```

---

#### API

The composable returns a reactive object containing the following properties:

- `currentBreakpoint: Ref<BreakpointKey>`: A reactive string that holds the key of the current breakpoint (`'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, or your custom key).
- `isMobile: Ref<boolean>`: A reactive boolean that is `true` if the screen width is less than or equal to the default `sm` breakpoint (or your custom mobile breakpoint).
- `isTablet: Ref<boolean>`: A reactive boolean that is `true` if the screen width is between the default `md` and `lg` breakpoints (or your custom tablet breakpoints).
- `isDesktop: Ref<boolean>`: A reactive boolean that is `true` if the screen width is greater than or equal to the default `xl` breakpoint (or your custom desktop breakpoint).
