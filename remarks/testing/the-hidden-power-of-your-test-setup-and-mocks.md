# The Hidden Power of Your Test Setup and Mocks

Have you ever looked at a test file and seen the same setup code repeated over and over? Maybe you're mocking the same API service, or setting up a global `localStorage` mock in dozens of different files. This isn't just a nuisance; it's a huge problem. This leads to **duplication** and **tight coupling**, making your tests difficult to maintain.

We need a way to **decouple our tests from our dependencies**.

---

## Centralizing with `vitest.setup.ts`

The `vitest.setup.ts` or `jest.setup.ts` file is a central place for code that should run **before every test file**. Its main advantage is that it allows you to configure global test settings and, most importantly, **set up global mocks**.

Imagine you have an API service for user authentication that's used across your application. Instead of mocking it in every test file, you can do it once in your setup file.

Here's a simple `vitest.setup.ts` example:

```typescript
// vitest.setup.ts

import { vi } from "vitest";
import * as authService from "@/services/authService";

// We export the mocked functions so we can access and override them
export const isUserLoggedIn = vi.spyOn(authService, "isLoggedIn").mockReturnValue(true);
export const getCurrentLoggedInUser = vi
  .spyOn(authService, "getCurrentUser")
  .mockReturnValue({ id: 1, name: "Test User" });
```

Now, every single test you run will automatically use this mock for `authService`. You no longer need to write `vi.mock()` at the top of every file. This saves time, reduces duplication, and makes your tests much cleaner.

The primary benefit is **maintainability**. If you need to update the `authService` mock, you only have to change it in one place.

---

## Flexibility: Overriding Mocks in Specific Tests

This is where the real power comes in. While you have a global default mock, sometimes you need a specific test to behave differently. By exporting the mocked functions from your setup file, you can easily override their return values for a particular test case.

Let's say you have a component that should show a different message if the user is not logged in. You can write a test for this specific scenario like this:

```typescript
// SomeComponent.test.ts

import { mount } from "@vue/test-utils";
import SomeComponent from "@/components/SomeComponent.vue";
import { isUserLoggedIn } from "../../vitest.setup.ts"; // Import the mocked function

describe("SomeComponent", () => {
  it("should show a login message if the user is not logged in", async () => {
    // Override the globally mocked function for this specific test
    isUserLoggedIn.mockReturnValueOnce(false);

    const wrapper = mount(SomeComponent);
    expect(wrapper.text()).toContain("Please log in to continue.");
  });

  // Other tests will still use the default mock of `isUserLoggedIn` returning true.
});
```

This approach combines the best of both worlds: a **global default** mock for most tests, but the flexibility to **customize** the mock's behavior for tests that require a different scenario. This is a crucial aspect of writing robust and comprehensive tests.

---

## Advanced Mocking: Partial Mocks and Hoisting

Sometimes you don't want to mock an entire module; you just want to replace one or two functions while keeping the rest of the original implementation. This is where more advanced mocking techniques come into play.

### Mocking with `vi.hoisted`

Normally, you can't access variables from your test file inside a `vi.mock` factory. **`vi.hoisted`** solves this by "hoisting" the mock definition to the top of the file, allowing you to create dynamic mocks. This is useful when your mock's behavior depends on a variable you define in your test.

You can also use `vi.hoisted` to create a reusable mock function that can be used inside multiple `vi.mock` calls, making your mock logic cleaner and more consistent.

```typescript
// SomeComponent.test.ts

import { vi } from "vitest";

const mockedGetPosts = vi.hoisted(() => {
  return vi.fn(() =>
    Promise.resolve([
      { id: 1, title: "Mock Post 1" },
      { id: 2, title: "Mock Post 2" },
    ]),
  );
});

vi.mock("@/api", () => ({
  getPosts: mockedGetPosts, // Reusing the hoisted mock function
}));

describe("SomeComponent", () => {
  it("should fetch and display posts on mount", async () => {
    // The `getPosts` function is already the mocked version
    const wrapper = shallowMount(SomeComponent);
    await wrapper.vm.$nextTick();
    expect(mockedGetPosts).toHaveBeenCalled();
  });
});
```

This is a more complex but very powerful way to create flexible mocks.

### Partial Mocks with `vi.importActual`

For more fine-grained control, you can use **`vi.importActual`** (or **`vi.importOriginal`** for CommonJS modules) inside a mock factory. This function gives you access to the real, un-mocked module, allowing you to only mock the parts you need.

Let's say you only want to mock the `isLoggedIn` function but keep the original `getCurrentUser` function.

```typescript
// authService.test.ts

import { vi } from "vitest";

vi.mock("@/services/authService", async (importActual) => {
  const actualAuth = await importActual<typeof import("@/services/authService")>();
  return {
    ...actualAuth, // Use all original exports
    isLoggedIn: vi.fn(() => true), // But override this one
  };
});
```

This ensures that your test only overrides the specific behavior it needs to, further reducing the coupling between your test and the implementation details of the module.

---

## The Magic of the `__mocks__` Directory

While `vitest.setup.ts` is great for global mocks, the `__mocks__` directory is the perfect solution for **automatic mocking of modules**.

When you place a file with the same name as a module inside a `__mocks__` directory, Vitest (and Jest) will automatically use that file as the mock whenever the original module is imported. You can even use `vi.importActual` within this mock file to create partial mocks automatically.

The `__mocks__` directory provides **loose coupling** between your tests and your implementation. Your test file has no idea that `fetchPosts` is being mocked; it simply imports it and uses it. This makes your tests more robust and less likely to break when you refactor your original code.

---

## The Ultimate Payoff: Decoupled and Resilient Tests

The real power of these tools is that they allow you to create tests that only care about the **behavior** of your code, not its internal dependencies.

- **`vitest.setup.ts`** is for **global, application-wide mocks** that apply to all your tests. You can also export these mocks for overriding.
- **`__mocks__`** is for **automatic, module-level mocks** that apply whenever a specific module is imported.
- **`vi.hoisted`** and **`vi.importActual`** provide the necessary flexibility for creating advanced, partial mocks when simple mocking isn't enough.

By using these tools, you're not just making your tests shorter. You're building a testing strategy that's resilient to change. You can refactor your services, change your API endpoints, or switch data libraries, and your tests will remain intact, as long as the mocked behavior is consistent.
