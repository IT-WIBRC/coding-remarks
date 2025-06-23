# Making Nuxt's "Secret Notes" Work in Tests (`useRuntimeConfig()` with Vitest)

Imagine your Nuxt.js app is like a detective. This detective needs to know some "secret notes" to do its job, like the address of a hidden meeting place (an API server) or a special password (an API key).

In Nuxt, this detective gets its "secret notes" using a special tool called `useRuntimeConfig()`.

---

## 1\. What are Nuxt's "Secret Notes" (`useRuntimeConfig()`)?

- **App Settings:** These are like little pieces of information your app needs _while it's actually running_. For example:

  - The web address of your main server.
  - A special code word for connecting to a map service.
  - Whether a new feature should be turned ON or OFF for users.

- **They Change:** These "secret notes" can be different when you're just building the app on your computer versus when the app is live for everyone on the internet.

- **How you get them:** You use `useRuntimeConfig()` in your code to grab these notes.

  ```typescript
  // In your Nuxt code (like a component or a small reusable function)
  const notes = useRuntimeConfig();
  console.log("My server is at:", notes.public.serverAddress);
  ```

---

## 2\. The Problem: Tests Don't Know the Secrets\!

When you write tests using Vitest, it's like you've taken your detective (your app's code) and put it into a **soundproof, empty testing room**.

- **No Real Nuxt App:** In this testing room, there's no full Nuxt app running in the background to give `useRuntimeConfig()` its real "secret notes."
- **The Tool is Empty:** So, if your code calls `useRuntimeConfig()` in this empty room, it just gets back nothing, or an empty box.
- **Test Fails:** Your detective (your code) gets confused because it can't find the `serverAddress` on an empty box, and your test crashes\!

---

## 3\. The Solution: "Mocking" (`vi.mock()`) - Giving Fake Secret Notes for Tests

To solve this, we do a trick called **"mocking."** Mocking means: "When we're in the testing room, if anyone asks for the 'secret notes' using `useRuntimeConfig()`, don't try to find the _real_ notes. Instead, just give them _these fake notes_ that I made up for the test."

Vitest has a special magic spell for this called `vi.mock()`.

---

## 4\. How to Do the Magic Trick: Mocking `useRuntimeConfig()`

You tell Vitest _exactly_ what `useRuntimeConfig()` should pretend to return.

```typescript
// At the VERY TOP of your test file
import { vi } from "vitest"; // Need vi for mocking

// This is the magic spell:
// "Whenever anything tries to import 'useRuntimeConfig' from '#app' (Nuxt's tool),
// replace it with this fake version."
vi.mock("#app", () => {
  return {
    useRuntimeConfig: vi.fn(() => {
      // This is the FAKE function that gets called
      // These are the FAKE "secret notes" that useRuntimeConfig() will give out in your test
      return {
        public: {
          // 'public' usually means settings that are safe to show in the browser
          serverAddress: "https://fake-test-server.com", // Our fake server address
          weatherApiKey: "fake-weather-key", // Another fake secret note
        },
        // If your app uses 'private' config that's not 'public', you'd add it here too.
        // private: { databasePassword: 'mock-password' }
      };
    }),
  };
});
```

**What happens now:** No matter where in your app's code `useRuntimeConfig()` is called (in a component, in another function, etc.), during the test, it will always get `https://fake-test-server.com` as the `serverAddress`.

---

## 5\. Example 1: `useRuntimeConfig()` Used Directly in a Component

Let's say you have a simple Vue component that shows the server address.

### Component Code (`components/ServerStatus.vue`)

```vue
<script setup lang="ts">
import { useRuntimeConfig } from "#app"; // Grabs the secret notes

const notes = useRuntimeConfig();
const serverUrl = notes.public.serverAddress; // Reads a secret note
</script>

<template>
  <div>
    <p>Server Status:</p>
    <p>Connected to: {{ serverUrl || "Unknown" }}</p>
  </div>
</template>
```

### Test Code (`test/components/ServerStatus.test.ts`)

```typescript
import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ServerStatus from "~/components/ServerStatus.vue";

// The 'vi.mock' code from Section 4 goes here, at the top of this test file.
// It will make useRuntimeConfig() return our fake notes.

describe("ServerStatus Component", () => {
  // Good habit: clean up mocks before each test, just in case
  beforeEach(() => {
    vi.clearAllMocks(); // Wipes clean any memory of previous calls to mocked functions
  });

  it("shows the fake server address from the notes", () => {
    const wrapper = mount(ServerStatus); // Make the component appear in the test room

    // We check if the component used our fake secret note correctly
    expect(wrapper.text()).toContain("Connected to: https://fake-test-server.com");
  });

  it('shows "Unknown" if the fake address is missing', () => {
    // For *this specific test*, we'll make useRuntimeConfig() return different fake notes
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: {
        // serverAddress is missing here on purpose
      },
    } as any); // 'as any' helps TypeScript when we're simplifying the mock

    const wrapper = mount(ServerStatus);
    expect(wrapper.text()).toContain("Connected to: Unknown");
  });
});
```

---

## 6\. Example 2: `useRuntimeConfig()` Used Inside a Reusable Function (Composable)

It's common to put reusable logic into "composables" (small, special functions in Nuxt). If your composable needs the "secret notes," it also calls `useRuntimeConfig()`.

### Reusable Function Code (`composables/useServerInfo.ts`)

```typescript
import { useRuntimeConfig } from "#app"; // Grabs the secret notes

export function useServerInfo() {
  const notes = useRuntimeConfig();
  const address = notes.public.serverAddress;
  const key = notes.public.weatherApiKey;

  // This function just gives us info about the server
  return {
    serverAddress: address,
    weatherKey: key,
    // Maybe a function to build a URL:
    getWeatherApiUrl: (city: string) => `${address}/weather?city=${city}&key=${key}`,
  };
}
```

### Component Using the Reusable Function (`components/WeatherWidget.vue`)

```vue
<script setup lang="ts">
import { useServerInfo } from "~/composables/useServerInfo"; // Uses our reusable function

const { serverAddress, weatherKey, getWeatherApiUrl } = useServerInfo();

const exampleWeatherUrl = getWeatherApiUrl("London");
</script>

<template>
  <div>
    <h2>Weather Widget</h2>
    <p>Using server: {{ serverAddress }}</p>
    <p>Example Weather API Call: {{ exampleWeatherUrl }}</p>
  </div>
</template>
```

### Test Code (`test/components/WeatherWidget.test.ts`)

Here's the cool part: the **same `vi.mock('#app', ...)`** we used before still works\! Because `useServerInfo` calls `useRuntimeConfig()` from `#app`, our mock will automatically jump in and give it the fake notes.

```typescript
import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WeatherWidget from "~/components/WeatherWidget.vue";

// The 'vi.mock' code from Section 4 goes here, at the top of this test file.
// It will make useRuntimeConfig() return our fake notes,
// and then useServerInfo will get those fake notes!

describe("WeatherWidget Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows server info from the composable using mocked notes", () => {
    const wrapper = mount(WeatherWidget);

    // The composable 'useServerInfo' will get our fake notes from the mock
    expect(wrapper.text()).toContain("Using server: https://fake-test-server.com");
    expect(wrapper.text()).toContain(
      "Example Weather API Call: https://fake-test-server.com/weather?city=London&key=fake-weather-key",
    );
  });

  it("handles missing API key in fake notes", () => {
    // For *this test*, change the fake notes to be missing the API key
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: {
        serverAddress: "https://another-fake-server.com",
        // weatherApiKey is missing here
      },
    } as any);

    const wrapper = mount(WeatherWidget);
    expect(wrapper.text()).toContain("Using server: https://another-fake-server.com");
    // The composable will get 'undefined' for weatherKey, and the URL will reflect that
    expect(wrapper.text()).toContain(
      "Example Weather API Call: https://another-fake-server.com/weather?city=London&key=undefined",
    );
  });
});
```

---

## 7\. Key Things to Remember About Mocking `useRuntimeConfig()`

- **`vi.mock('#app', ...)` is your best friend:** This is the main trick to make `useRuntimeConfig()` give out fake notes.
- **Target the Source (`#app`):** Always mock `#app`. Don't try to mock your composable directly for `useRuntimeConfig()`, because the composable _gets_ its notes from `#app`. Mocking `#app` makes sure everyone gets the fake notes.
- **`vi.fn()` for Pretending:** Using `vi.fn(() => ({ ... }))` creates the fake function that returns your custom "secret notes."
- **`beforeEach(() => vi.clearAllMocks())`:** Do this in your test files\! It's like wiping the whiteboard clean before each new test, so the fake notes from one test don't accidentally spill over into another test.
- **Why bother with fake notes?**
  - **Focus:** Your test only checks _your_ code (component or composable), not the complicated process of Nuxt finding real secret notes.
  - **Speed:** Fake notes are instant\! No need to start a whole Nuxt app.
  - **Control:** You decide _exactly_ what the secret notes say for each test. This lets you test all kinds of situations (notes are missing, notes have wrong values, etc.).
  - **Reliability:** Your tests won't break just because the real server address changed.

By learning this mocking trick, you can write reliable and fast tests for all parts of your Nuxt application that use `useRuntimeConfig()`, no matter how deeply it's used\!
