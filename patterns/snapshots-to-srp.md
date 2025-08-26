# Learning the Single Responsibility Principle with Snapshot Tests

This is the second part of a two-part series on learning the Single Responsibility Principle (SRP) through testing. The first part, [Learning the Single Responsibility Principle, One Test at a Time](tdd-to-srp.md), focuses on using Test-Driven Development (TDD) to understand and implement SRP in general programming. This part dives into a specific application of SRP in the context of Vue.js components, using snapshot testing as a practical tool to guide refactoring.

### The "Aha\!" Moment: Unreadable Snapshots

If you've been following along, you know that a component that's difficult to test is a strong signal that it's doing too much. This is where snapshot testing can give you a powerful, tangible warning.

Imagine you're working on a `UserProfilePage.vue` component. This component not only displays a user's details but also handles a "follow" button, a list of their posts, and fetches all the data for these sections. If you were to write a snapshot test for this component, the result would be a massive, multi-hundred-line file. This is your "aha\!" moment. This unreadable snapshot isn't just a nuisance; it's a guide. It's a clear, frustrating consequence that tells you, "This component needs to be broken down."

---

### The Unreadable Snapshot is Your Guide to Refactoring

A large, messy snapshot is a primary indicator of a bloated component. By breaking this component into smaller, single-responsibility components, you'll end up with multiple small, clean, and highly readable snapshots. This process turns a theoretical principle into a practical, step-by-step refactoring task.

Here's our complex `UserProfilePage.vue` component, rewritten with the Composition API:

```html
<template>
  <div class="profile-container">
    <header class="profile-header">
      <img class="user-avatar" :src="user.avatar" alt="User avatar" />
      <h1 class="user-name">{{ user.name }}</h1>
      <button class="follow-button" @click="handleFollow">Follow</button>
    </header>
    <section class="profile-posts">
      <h2>Posts</h2>
      <div v-for="post in posts" :key="post.id" class="post-card">
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { getUser, getPosts, followUser } from "@/api/user";

  const props = defineProps({
    userId: {
      type: [String, Number],
      required: true,
    },
  });

  const user = ref(null);
  const posts = ref([]);

  const fetchUserData = async () => {
    user.value = await getUser(props.userId);
    posts.value = await getPosts(props.userId);
  };

  const handleFollow = () => {
    followUser(props.userId);
    // Logic for handling follow action
  };

  onMounted(() => {
    fetchUserData();
  });
</script>
```

Even with the Composition API, this component still does a lot. It handles data fetching, state management, and user interaction. When we break this down, our snapshots become much more manageable. The `UserProfilePage` can now focus on its single job: **orchestration**.

---

### Finding the Balance: Reusability vs. Encapsulation

This is a very important point: you're not aiming for "file hell" by turning every `<p>` tag into a separate component. A component should be created for one of two main reasons:

1.  **Reusability:** This is the most common reason. If a piece of UI, like a `Button` or a `PostCard`, is going to be used in multiple places, it's an independent, reusable building block and should be its own component.
2.  **Encapsulation:** Sometimes, a part of a larger component is simply too complex to be written inline. Even if this piece of UI is only used on one page, extracting it into its own component is still a valid use of SRP. You're not creating a reusable entity, but you are making the parent component more readable and manageable. The new component's single responsibility is to manage the complexity of that specific UI block.

The key is to **break down complexity**, not just to create more files.

---

### The Hidden Benefit: Testing Styles

A snapshot captures the complete rendered output, including CSS class names and the HTML structure. This means a snapshot test implicitly acts as a safeguard against unintended style regressions. If you accidentally change a class name from `user-name` to `user-title` in a child component, its snapshot will fail. This flags a visual change that you might have overlooked. You are then forced to acknowledge and approve the change, reinforcing that a style change is a valid "reason to change" for a component.

---

### Snapshotting the Orchestrator

Following the principle of orchestration, a page's single responsibility is to compose other components. Therefore, a snapshot test for a page component should not be a massive file. Instead, it should mock the child components.

Here's our refactored `UserProfilePage.vue`:

```html
<template>
  <div class="profile-page-layout">
    <UserHeader :user-id="userId" />
    <UserPosts :user-id="userId" />
  </div>
</template>

<script setup>
  import UserHeader from "./UserHeader.vue";
  import UserPosts from "./UserPosts.vue";

  const props = defineProps({
    userId: {
      type: [String, Number],
      required: true,
    },
  });
</script>
```

And here's how you'd test it using `@vue/test-utils` and Jest:

```javascript
// UserProfilePage.test.js - Testing the Orchestrator

import { shallowMount } from "@vue/test-utils";
import UserProfilePage from "@/components/UserProfilePage.vue";

describe("UserProfilePage", () => {
  it("should render the orchestrator component correctly", () => {
    const wrapper = shallowMount(UserProfilePage, {
      props: { userId: 1 },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
});
```

The use of **`shallowMount`** is key here. It stubs out the child components (`UserHeader` and `UserPosts`), so the snapshot for the `UserProfilePage` is clean and concise. It only verifies that the page is correctly rendering its children with the right props, fulfilling its single responsibility as an orchestrator.

---

### Unit Tests as a Regression Safety Net

This practice turns individual unit tests into a powerful regression safety net. By having a focused snapshot test for every small, single-responsibility component, you build a robust system. If you change a low-level component (like a `PostCard`) and it breaks its snapshot, you have caught a regression at the source. This prevents the bug from ever reaching higher-level components like pages, which would be much harder to debug.

---

### Mocking Services and Stores to Test "Wiring"

For orchestrator components, snapshot testing also helps verify the "wiring" or data flow. To test a page component, you must mock the services or stores it depends on. The snapshot test then confirms that the page correctly fetches the data (from your mock) and passes it down to the appropriate child components. You're not testing the data-fetching logic itself (that's the service's responsibility); you're testing the page's ability to act as a conductor.

---

### From Theory to Practice: The Ultimate Payoff

Using snapshot testing wisely turns the abstract concept of SRP into a tangible, achievable outcome. By prioritizing testability—and letting the unreadability of large snapshots be your guide—developers are naturally pushed toward writing smaller, more focused components. This leads to code that is not only easier to test, but also more maintainable, reusable, and ultimately, better designed.
