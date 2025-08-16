# TODO

## Why?

- [ ] Why is the timeout in requests important?
- [ ] Why is it important to cancel a request?
- [ ] Why is it important to learn C for every programmer or developer?
- [ ] Why never use Linux as admin but as a User with the same apps as the admin?

## Problem-Solving

- [x] Resolve husky problem on pre-commit (Understand why and document it for future usage)
- [ ] Check if there is any connectivity before doing a request. Do it globally before any request (Can use `navigator.online` for example or a more appropriate solution)
- [ ] Look for a way to avoid getting the same request when we go back to a page.

## Architecture & Principles

- [ ] Single responsibility principle
- [ ] To avoid coupling with tools you are using, create a separated layer to contain it, making it easy to switch from one tool to another without affecting the other layers. (Use context name instead of tool name)
- [ ] Content Security Policy (CSP): Websites can implement CSPs to tell your browser exactly which external resources (scripts, stylesheets, images, etc.) are allowed to be loaded on their page. (Implementation Front and Back)
- [ ] How to create your own simple toast instead of using a library
- [ ] How to structure your own Modal using (`<popover>`) or creating your own with a common structure mimicking the native one
- [ ] Composable to detect an outside click
- [ ] Learn reusable workflow with GitHub and signed commits

## Code & Best Practices

- [ ] `eslint-plugin-jsx-a11y` (Test using screen readers like NVDA or VoiceOver) — SEO
- [ ] `input` autocomplete property
- [ ] Don't use the `.d.ts` file for handwriting types inside your file for projects that are not a library as it can be harmful, use a normal `.ts` file instead (recommendation from the TS team). To enforce it, use `skipLibCheck` set to `true`.
- [ ] Always search for repeating code (title, description, button, etc.) and create a component to reuse.
- [ ] Look into `vite-tsconfig-paths`.

## Tools & Concepts

- [ ] Map and Set for `select` and `select multiple` and more, and learn how to effectively use them as well as `WeakMap`, `WeakSet`, `Array`, and `Object`.
- [ ] Commons stubs I used to use (`i18n`, partial module, module mock, spy on window property, etc.)

## Soft Skills

- [ ] Skills needed (communication, awkward communication, critical thinking, good decision making, goal and organization)
