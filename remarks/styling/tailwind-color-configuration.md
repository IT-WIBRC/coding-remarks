# Tailwind CSS Color Configuration Best Practice

**Guideline:** All design system colors should be configured directly in your `tailwind.config.js` file, utilizing Tailwind's opacity modifiers for variations.

**Explanation:**

* **Single Source of Truth:** Your `tailwind.config.js` becomes the central definition for your brand's color palette, ensuring consistency across the entire application.
* **Maintainability & Adaptability:** Changes to primary colors (e.g., brand rebranding) require only modifying the color definitions in one file, instantly updating everywhere it's used. This dramatically reduces maintenance overhead.
* **Reusability:** You can easily apply consistent color variations (e.g., `bg-primary/50` for 50% opacity, `text-secondary/[.85]` for 85% opacity) without hardcoding hex values or creating numerous custom utility classes.

**Example (`tailwind.config.js`):**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3490dc', // Base color
          50: '#eff6ff',
          100: '#dbeafe',
          // ... other shades if needed, or rely on opacity modifiers
        },
        secondary: {
          DEFAULT: '#6574cd',
        },
        // ... define other semantic colors (e.g., 'accent', 'danger', 'success')
      },
    },
  },
  // ...
};
```

**Usage in Vue Components:**
```html
<template>
  <button class="bg-primary-DEFAULT text-white px-4 py-2 rounded-lg hover:bg-primary/80">
    Primary Button
  </button>
  <p class="text-secondary/60">A secondary color with 60% opacity.</p>
</template>
```