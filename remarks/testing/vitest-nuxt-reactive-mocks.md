## Testing Reactive Composables in Nuxt & Vitest: Overcoming Mocking Challenges

Testing components that rely on reactive composables in a Nuxt.js and Vitest environment can sometimes lead to perplexing issues. You might find your mock functions are called, but the reactive state they're supposed to influence doesn't appear to update within the component under test. This often results in failed assertions, even when your debugging logs suggest everything is in place. This article will delve into the nuances of Vitest's strict matchers and, more importantly, provide a robust strategy for mocking reactive composables, addressing the common "different instances" problem.

### Understanding Vitest's Strict Matchers

Before we tackle reactive mocks, let's briefly review Vitest's strict matchers, as they are fundamental to asserting equality in your tests.

1.  **`.toBe(value)`: Strict (Reference) Equality**

    - This matcher checks if two values are **identical** using `Object.is` (which behaves like `===`).
    - For objects or arrays, it only passes if they refer to the **exact same instance** in memory.
    - **Example:**

      ```typescript
      const user1 = { id: 1, name: "Alice" };
      const user2 = { id: 1, name: "Alice" };

      expect(user1).toBe(user1); // PASSES (same memory reference)
      expect(user1).toBe(user2); // FAILS (different memory references, even if content is identical)
      expect("hello").toBe("hello"); // PASSES (primitive value)
      ```

2.  **`.toEqual(value)`: Deep (Value) Equality**

    - This matcher recursively checks the **value of all enumerable properties** of objects and elements of arrays.
    - It does not care about the exact memory reference; it only asserts that the _content_ is the same.
    - Crucially, `toHaveBeenCalledWith` uses `toEqual` internally for comparing object/array arguments.
    - **Example:**

      ```typescript
      const productA = { name: "Laptop", specs: { ram: "16GB" } };
      const productB = { name: "Laptop", specs: { ram: "16GB" } };

      expect(productA).toEqual(productB); // PASSES (content is identical, despite different references)
      expect([1, { status: "active" }]).toEqual([1, { status: "active" }]); // PASSES
      ```

3.  **`.toStrictEqual(value)`: Strictest Deep Equality**

    - This is the most rigorous of the value-checking methods. It's like `toEqual` but adds extra checks:
      - It compares object prototypes.
      - It ensures that `undefined` properties in the expected object are also `undefined` in the received object (unlike `toEqual`, which ignores `undefined` properties in the expected object).
    - **Example:**

      ```typescript
      const config1 = { timeout: 1000, debug: undefined };
      const config2 = { timeout: 1000 };

      expect(config1).toEqual(config2); // PASSES (toEqual ignores `debug: undefined` in config1)
      expect(config1).toStrictEqual(config2); // FAILS (config2 is missing the `debug: undefined` property)
      ```

### The Challenge: Mocking Reactive Composables in Nuxt/Vitest

Let's consider a common scenario with a `useNotifier` composable and a `NotificationDisplay` component.

**`~/composables/useNotifier.ts`:**

```typescript
// ~/composables/useNotifier.ts
import { reactive } from "vue";

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

// This is the single reactive array instance in the real application
const _notifications: Notification[] = reactive([]);
let nextId = 0;

export function useNotifier() {
  const addNotification = (message: string, type: Notification["type"] = "info") => {
    _notifications.push({ id: String(nextId++), message, type });
  };

  const dismissNotification = (id: string) => {
    const index = _notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      _notifications.splice(index, 1);
    }
  };

  return {
    notifications: _notifications, // The reactive array is returned
    addNotification,
    dismissNotification,
  };
}
```

**`~/components/NotificationDisplay.vue`:**

```vue
<!-- ~/components/NotificationDisplay.vue -->
<script setup lang="ts">
import { useNotifier } from "~/composables/useNotifier"; // Nuxt auto-import or direct import

const { notifications } = useNotifier(); // Component accesses the reactive array
</script>

<template>
  <div class="notification-container">
    <div v-if="notifications.length === 0">No notifications</div>
    <div v-for="notification in notifications" :key="notification.id" class="notification-item">
      <span :class="`notification-type-${notification.type}`"
        >{{ notification.type.toUpperCase() }}:</span
      >
      {{ notification.message }}
    </div>
  </div>
</template>
```

When writing a test for `NotificationDisplay.vue`, you want to mock `useNotifier` so you can control its `notifications` array and verify calls to `addNotification`.

A common initial approach is to set up a global mock in `vitest.setup.ts`.

#### What is `vitest.setup.ts`?

The `vitest.setup.ts` file is a special file configured in your `vitest.config.ts` (via the `setupFiles` option). It runs **once before all your test files** are executed. Its purpose is to set up a consistent global test environment, define global mocks, or extend Vitest's matchers.

**Example `vitest.setup.ts` (Problematic Global Mock):**

```typescript
// vitest.setup.ts
import { vi } from "vitest";
import { reactive } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const globalMockNotifications = reactive([]); // Global reactive array for the mock
const globalMockAddNotification = vi.fn((message, type) => {
  globalMockNotifications.push({ id: "global-mock-id", message, type });
});

// Attempting to mock useNotifier globally
mockNuxtImport("useNotifier", () => {
  console.log("--- MOCKING useNotifier via mockNuxtImport (global) ---");
  return vi.fn(() => ({
    notifications: globalMockNotifications, // Return the global reactive array
    addNotification: globalMockAddNotification,
    dismissNotification: vi.fn(),
  }));
});
```

**The Test (`components/NotificationDisplay.test.ts` - Problematic):**

```typescript
// components/NotificationDisplay.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick } from "vue";
import NotificationDisplay from "./NotificationDisplay.vue";

// We'd expect globalMockNotifications to be used, but...
// (No local vi.mock here, relying on global setup)

describe("NotificationDisplay", () => {
  beforeEach(() => {
    // How do we clear globalMockNotifications from here? We need to expose it.
    // This already hints at a problem with managing the global mock's state.
  });

  it("should display a notification when added (failing scenario)", async () => {
    // Call the mocked addNotification (which pushes to globalMockNotifications)
    // PROBLEM: We don't have direct access to globalMockAddNotification here easily.
    // Let's assume for a moment we could call it:
    // globalMockAddNotification('Test message', 'info');
    // await nextTick();

    const wrapper = await mountSuspended(NotificationDisplay);
    await nextTick();

    // The component's `notifications` array might still be empty!
    expect(wrapper.find(".notification-item").exists()).toBe(false); // This fails!
  });
});
```

#### Why the Problem Occurs: The "Different Instances" Conundrum

The core reason for this disconnect, even with global mocks in `vitest.setup.ts`, is often related to **module caching and instance identity** within Vitest's test runner:

1.  **Module Loading Order:** Vitest and Vite's module resolution can be complex. Sometimes, the _real_ `~/composables/useNotifier.ts` module might be loaded and cached by Node.js/Vitest _before_ your `vitest.setup.ts` file has fully executed its `vi.mock()` or `mockNuxtImport()` calls for that specific module. Once the real module is cached, it's hard to truly override it for all subsequent imports.
2.  **Instance Mismatch:** If the real module is loaded, then your `NotificationDisplay` component will end up calling the _real_ `useNotifier` composable, which has its own, separate, and initially empty `_notifications` reactive array. Meanwhile, in your test file, you might be manipulating a _different_ `mockNotifications` array. They are two distinct reactive arrays in memory.
3.  **Setup File Limitations:** While `vitest.setup.ts` is great for truly global, stateless mocks (like `vi.useFakeTimers()`), managing reactive state across multiple tests via a global singleton can be tricky if the module system doesn't guarantee the exact same instance is always provided to all consumers.

### The Robust Solution: Singleton Mocks & Local Application

The most reliable way to ensure your component interacts with the exact reactive mock instance you're controlling in your test is to combine a centralized mock definition with a **local `vi.mock()`** within the specific test file.

#### 1\. Centralized Singleton Mock (`test/mocks/mockUseNotifier.ts`)

This file will define the _single, persistent_ reactive array and the `vi.fn()` spy instances. It also provides a getter function to access this singleton and a `reset` method for test isolation.

```typescript
// test/mocks/mockUseNotifier.ts
import { vi } from "vitest";
import { reactive } from "vue";

interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "error";
}

// THIS IS THE SINGLE REACTIVE ARRAY INSTANCE
const _notifications: Notification[] = reactive([]);
let _nextId = 0;

// THESE ARE THE SINGLE VI.FN() SPY INSTANCES, DIRECTLY EXPORTED
export const mockAddNotification = vi.fn((message: string, type: Notification["type"] = "info") => {
  _notifications.push({ id: `mock-id-${_nextId++}`, message, type });
});

export const mockDismissNotification = vi.fn((id: string) => {
  const index = _notifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    _notifications.splice(index, 1);
  }
});

// This function provides the current mock instance and a way to reset it.
// Any test file or mock setup will call this to get the *same* instance.
export const getMockUseNotifierInstance = () => ({
  notifications: _notifications, // The reactive array
  addNotification: mockAddNotification, // Reference the exported spy function
  dismissNotification: mockDismissNotification, // Reference the exported spy function
  // Method to reset the internal state of this specific mock instance
  reset: () => {
    _notifications.splice(0, _notifications.length); // Clear the reactive array
    _nextId = 0; // Reset ID counter
    mockAddNotification.mockClear(); // Clear spy call history
    mockDismissNotification.mockClear(); // Clear spy call history
  },
});
```

#### 2\. Update `vitest.setup.ts` (Remove Specific Mocks)

Your `vitest.setup.ts` should **no longer** contain `vi.mock` or `mockNuxtImport` for `useNotifier` (or `useToast`, `useI18n` if you're using this pattern for them). It should only handle truly global setup that doesn't suffer from the instance problem (like `vi.useFakeTimers()` if you prefer it globally, or `mockNuxtImport` for other utilities that don't have reactive state issues).

```typescript
// vitest.setup.ts
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { vi } from "vitest";
import mockI18n from "./__mocks__/@nuxtjs/i18n"; // Assuming you have this

// Mock useI18n as you already have it (if it doesn't suffer from instance issues)
mockNuxtImport("useI18n", () => mockI18n.useI18n);

// IMPORTANT: The vi.mock and mockNuxtImport for useNotifier have been REMOVED from here.
// They will be placed directly in the component test files where needed.

// If you want fake timers globally, uncomment this:
// vi.useFakeTimers();
```

#### 3\. Update Your Component Test File (`components/NotificationDisplay.test.ts`)

This is the crucial step. You will now apply the `vi.mock` directly within the test file.

```typescript
// components/NotificationDisplay.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick } from "vue";
import NotificationDisplay from "./NotificationDisplay.vue";

// Import the function to get the mock instance
import { getMockUseNotifierInstance } from "~/test/mocks/mockUseNotifier";

// Get the specific mock instance for use in THIS test file.
// This ensures that all parts of this test (and the component it mounts)
// interact with the EXACT SAME mock instance.
const notifierMock = getMockUseNotifierInstance();

// CRUCIAL: Apply the vi.mock directly in this test file's scope.
// This guarantees that when NotificationDisplay imports useNotifier,
// it receives the `notifierMock` instance you're controlling.
vi.mock("~/composables/useNotifier", () => ({
  useNotifier: vi.fn(() => notifierMock), // Return the specific mock instance
}));

describe("NotificationDisplay", () => {
  beforeEach(() => {
    notifierMock.reset(); // Reset the mock's internal state for each test
  });

  it("should display a notification when added", async () => {
    // Call the mock's addNotification method
    notifierMock.addNotification("Test message from mock", "info");
    await nextTick(); // Allow the mock's internal reactive array to update

    const wrapper = await mountSuspended(NotificationDisplay);
    await nextTick(); // Allow component to react to the updated mock data

    expect(wrapper.find(".notification-item").exists()).toBe(true);
    expect(wrapper.find(".notification-item").text()).toContain("Test message from mock");
    expect(wrapper.find(".notification-item").text()).toContain("INFO:");

    // Assert on the spy calls
    expect(notifierMock.addNotification).toHaveBeenCalledTimes(1);
    expect(notifierMock.addNotification).toHaveBeenCalledWith("Test message from mock", "info");
  });

  it('should display "No notifications" when none are present', async () => {
    const wrapper = await mountSuspended(NotificationDisplay);
    await nextTick();

    expect(wrapper.find(".notification-item").exists()).toBe(false);
    expect(wrapper.text()).toContain("No notifications");
  });

  it("should remove a notification when dismissed", async () => {
    notifierMock.addNotification("Message to remove", "error");
    await nextTick();

    const wrapper = await mountSuspended(NotificationDisplay);
    await nextTick();

    expect(wrapper.find(".notification-item").exists()).toBe(true);
    expect(wrapper.find(".notification-item").text()).toContain("Message to remove");

    // Get the ID of the notification that was added by the mock
    const notificationIdToRemove = notifierMock.notifications[0].id;
    notifierMock.dismissNotification(notificationIdToRemove);
    await nextTick(); // Allow component to react to the dismissal

    expect(wrapper.find(".notification-item").exists()).toBe(false);
    expect(wrapper.text()).toContain("No notifications");
    expect(notifierMock.notifications.length).toBe(0); // Verify mock's internal state
    expect(notifierMock.dismissNotification).toHaveBeenCalledTimes(1);
    expect(notifierMock.dismissNotification).toHaveBeenCalledWith(notificationIdToRemove);
  });
});
```

### Conclusion

The "reactive state disconnect" in Vitest tests, especially with Nuxt's auto-imports, often stems from different parts of your test environment (the test file itself and the component being mounted) receiving different instances of a mocked composable. By:

1.  **Centralizing your reactive mock state and `vi.fn()` spies** in a dedicated file, ensuring they are singletons.
2.  **Applying `vi.mock()` directly within the test file** where the component is mounted, guaranteeing that the component receives the _exact same mock instance_ you are controlling.
3.  **Rigorously resetting** that mock instance in `beforeEach`.

You establish a robust and predictable testing environment, allowing you to confidently assert on reactive state changes and mock function calls.
