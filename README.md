# Coding Remarks: Best Practices & Architectural Guidelines

This repository serves as a personal compendium of coding best practices, architectural guidelines, and valuable development remarks. It documents lessons learned and preferred approaches gathered across various programming languages and frameworks I've worked with, including JavaScript, TypeScript, Vue.js, Nuxt.js, and will expand to others in the future.

The goal is to foster consistent, maintainable, and testable code, serving as a quick reference and a living record of my evolving understanding of software development. **For a broader collection of development and IT resources, including articles, tutorials, and tools, be sure to check out the [Dev and IT Resource project](https://github.com/masterivanic/Dev-and-it-ressource).**

---

## Table of Contents

1.  [Core Principles & General Advice](#1-core-principles--general-advice)
2.  [Architectural Patterns & Design Choices](#2-architectural-patterns--design-choices)
3.  [Language & Framework Specific Remarks](#3-language--framework-specific-remarks)
    - [JavaScript & TypeScript](#javascript--typescript)
    - [Vue.js & Nuxt.js](#vuejs--nuxtjs)
    - [Styling (CSS, Tailwind CSS)](#styling-css-tailwind-css)
4.  [Utilities](#4-utilities)
5.  [Testing Strategies & Tooling](#5-testing-strategies--tooling)
6.  [Presentation-Style Remarks](#6-presentation-style-remarks)
7.  [NPM Package Management & Publishing](#7-npm-package-management--publishing)
8.  [Repository Structure](#8-repository-structure)

---

## 1. Core Principles & General Advice

These are foundational guidelines applicable to almost any programming context.

- [**General Coding Principles**](./remarks/general/general-coding-principles.md)
  - Favor Modularity and Single Responsibility
  - Embrace Immutability
  - Practice Defensive Programming
  - Consistent and Descriptive Naming
  - Smart Error Handling & User Feedback
  - Performance Awareness
  - Continuous Learning & Refactoring
  - Code Reviews & Pair Programming
- [**Git Workflow & Hooks (`pre-commit` and `pre-push` Strategy)**](./remarks/general/git-workflow-hooks.md)
  - Recommended `pre-commit` actions (Linter, Formatter, Type Checking)
  - Recommended `pre-push` actions (Unit Tests, PR Workflow with Squashing)
  - Commit Message Formatting (Conventional Commits with Commitlint)
- [**GitHub Actions: CI/CD Pipeline Recommendations**](./remarks/general/github-actions-ci-recommendations.md)
  - Recommended CI/CD stages and jobs (PR checks, Deployments).
  - Importance of CI/CD even with Git hooks.
- [**EditorConfig for Consistent Code Style**](./remarks/general/editorconfig.md)
  - Using `.editorconfig` to enforce consistent coding styles across different editors.
  - Key settings: Indentation, Line Endings, Character Set, End of Line,
    Trim Trailing Whitespace, Insert Final Newline.
- [**AI Learning Caution: The Importance of Struggle**](./remarks/general/ai-learning-caution.md)
  - The dangers of over-reliance on AI tools for coding.
  - Key skills you miss out on when AI does the heavy lifting.
  - How to use AI as a tool, not a crutch: struggle first, then ask for help.
  - The importance of critical thinking, problem-solving, and building intuition.

---

## 2. Architectural Patterns & Design Choices

In-depth explanations of high-level architectural patterns and significant design decisions.

- [**Facade Pattern: Simplifying Complex Interactions in the Frontend**](./patterns/facade-pattern.md)
  - Rationale for simplifying complex subsystem interactions.
  - Benefits: Reduced component complexity, centralized orchestration, improved maintenance.
  - Examples of direct calls vs. Facade usage.
  - When and where to apply the pattern.
- [**Monads: Either and Maybe for Robust Data Flow**](./patterns/monads-either-maybe.md)
  - Detailed explanation of `Either` and `Maybe` Monads.
  - Functional Programming principles encouraged by Monads (Immutability, Pure Functions, Composition, Separation of Concerns).
  - Combined power with Domain Management for decoupled and agnostic code.
- [**API Service Layer Design**](./patterns/api-service-layer-design.md)
  - Rationale for dedicated service classes with static methods.
  - Benefits: Separation of Concerns, Testability, Reusability, Consistent Error Handling.
- [**Domain Management using Abstraction (IDomain & Null Object Pattern)**](./patterns/domain-management-abstraction.md)
  - Defining `IDomain` interface and concrete domain classes.
  - Advantages: Eliminating Null Checks, Decoupling from API Structure, Encapsulation of Business Logic.
- [**Why Separate UI, Service, Domain, Validation, and Store Layers**](./patterns/why-separate-layers.md)
  - Fundamental reasons for separating concerns in application architecture.
  - Benefits: Maintainability, Testability, Readability, Reusability, Scalability, Flexibility.
- [**Functional Programming Principles for Clean Code**](./patterns/functional-programming-principles.md)
  - Deep dive into Pure Functions, Immutability, First-Class/Higher-Order Functions, Composition, and Declarative vs. Imperative Programming.
  - Impact on Clean Code Architecture goals (Testability, Modularity, Readability, Predictability).

---

## 3. Language & Framework Specific Remarks

Practical advice and common patterns specific to particular technologies.

### JavaScript & TypeScript

- [Guide to Fully Leveraging TypeScript](./remarks/typescript-javascript/leveraging-typescript.md)
- [Preventing Duplicate Function/Anonymous Function Addition](./remarks/typescript-javascript/prevent-duplicate-function-addition.md)
- [**Async/Await Explained: Why We Wait (Again and Again)**](./remarks/typescript-javascript/async-await-explained.md)
  - Understanding the wrapping of `async` functions and the importance of `await`.
  - Real-world example of fetching user data with multiple `await`s.
  - The concept of "unwrapping" promises in application logic.

### Vue.js & Nuxt.js

- [Composable/Utility Function Export Pattern](./remarks/vue-nuxt/composable-utility-export-pattern.md)
- [Module Import Style Guidelines](./remarks/vue-nuxt/module-import-style.md)
- [Store (State Management) Usage Scope](./remarks/vue-nuxt/store-usage-scope.md)
- [Reactivity with `shallowRef` Considerations](./remarks/vue-nuxt/reactivity-shallowref.md)
- [**Pinia Store Structure: Controlling External Exposure**](./remarks/vue-nuxt/pinia-store-encapsulation.md)
  - Using Composition API for true encapsulation.
  - Extracting internal logic to utilities.
  - Naming conventions.

### Styling (CSS, Tailwind CSS)

- [Tailwind CSS Color Configuration Best Practice](./remarks/styling/tailwind-color-configuration.md)

---

## 4. Utilities

In this section, we explore practical utility classes that demonstrate various coding patterns and provide reusable solutions for common tasks.

### [String Utilities (Fluent API)](./utils/string-utils.ts)

- **Description:** This utility class provides a set of common string manipulation methods (like `capitalize`, `toLowerCase`, `trim`, `replace`, etc.) designed to be **chainable**. It also includes helpful validation methods such as `isEmpty`, `isLessThan`, `isMoreThan`, and `isEqual`. This allows you to apply multiple transformations and perform checks on a string in a clean, readable, and fluent manner, mimicking natural language.
- **Key Learning Points:**
  - **Fluent API / Method Chaining:** How to design methods that return `this` (the current instance) to enable chaining multiple operations.
  - **Static Factory Methods:** Using `StringUtils.of()` to create instances without the `new` keyword, making the API more user-friendly and consistent.
  - **Encapsulation:** Managing internal string state (`currentString`) safely within the class.
  - **Practical String Manipulation & Validation:** Reusable helpers for common string tasks and checks, improving code readability and reducing repetition.

---

## 5. Testing Strategies & Tooling

Insights into testing methodologies and specific tool configurations.

- [Component Stubbing in Vue Tests](./remarks/testing/component-stubbing-vue.md)
- [Mocking `useRuntimeConfig` in Nuxt.js with Vitest](./remarks/testing/mocking-useRuntimeConfig-vitest.md)
- [Resolving Nuxt 3 Virtual Module Errors in Vitest (`#app` etc.)](./remarks/testing/nuxt-virtual-module-resolution.md)
- [**Test File Exclusion and Alias Resolution (Nuxt.js/Vite/Vitest)**](./remarks/testing/test-file-exclusion-and-aliases.md)
  - Vite's conventional exclusion of test files.
  - Alias and auto-import issues in test files.
  - IDE behavior differences.

---

## 6. Presentation-Style Remarks

Longer, more detailed explanations that might be suitable for internal presentations or deep dives.

- [**Vue.js Form Validation: Best Practices**](./presentations/vue-form-validation-best-practices.md)
  - Why direct component validation is not a best practice.
  - Recommended approaches: Client-side libraries, custom composables/utilities, server-side validation.
- [**The Trouble with Using "Raw API Data" Directly in Frontend Components**](./presentations/dto-advice-frontend.md)
  - The problem with using raw DTOs directly in frontend components.
  - Common issues: Naming inconsistencies, excess data, reactivity challenges, testing difficulties.
  - Recommended solution: Transform DTOs into "UI-Friendly" objects (Domain Objects or ViewModels).
  - Benefits of this approach: Cleaner code, easier testing, better maintainability.

---

## 7. NPM Package Management & Publishing

This section covers common challenges and best practices related to managing, versioning, and publishing NPM packages, including strategies for testing and structuring reusable plugin "flavors."

- [**NPM Publish Troubleshooting**](./npm/npm-publish-troubleshooting.md)
  - The 24-hour "no-go" rule for deleting and republishing.
  - Managing versions with `Changesets` (automated versioning and changelogs).
  - Handling build and transpilation issues.
  - Ensuring all necessary files are included in the published package.
  - Authentication and permissions for publishing.
  - Strategies for local package testing (`npm link`, `npm pack`).
  - Creating plugin "flavors" using `package.json` `exports` for different configurations.
  - [Linting Your Own Plugin's Code (`eslint-config-epsvue`)](./npm/npm-publish-troubleshooting.md) to maintain high quality.
  - [Test Your npm plugin locally](./npm/eslint-plugin-local-testing.md) for testing your code locally.

---

## 8. Repository Structure

This section outlines the current directory and file structure for the `coding-remarks` repository itself.

```

.
├── .git/                                    \# Git version control directory
├── .github/                                 \# GitHub specific configurations (e.g., workflows)
│   ├── workflows/
│   |    └── ci.yml                           \# GitHub Actions CI workflow (npm-based)
│   └── pull_request_template.md
├── .husky/                                  \# Git hooks managed by Husky
│   ├── pre-commit                           \# Runs lint-staged
│   ├── commit-msg                           \# Runs commitlint
│   └── \_/                                   \# Husky internal directory
├── .vscode/                                 \# VS Code editor settings (optional)
│   └── settings.json
├── remarks/                                 \# Categorized general coding remarks
│   ├── general/                             \# General coding advice details
│   │   ├── ai-learning-caution.md
│   │   ├── editorconfig.md
│   │   ├── general-coding-principles.md
│   │   ├── git-workflow-hooks.md
│   │   └── github-actions-ci-recommendations.md
│   ├── vue-nuxt/                            \# Vue.js & Nuxt.js specific remarks
│   │   ├── composable-utility-export-pattern.md
│   │   ├── module-import-style.md
│   │   ├── pinia-store-encapsulation.md
│   │   ├── reactivity-shallowref.md
│   │   └── store-usage-scope.md
│   ├── typescript-javascript/               \# TypeScript & JavaScript specific remarks
│   │   ├── async-await-explained.md
│   │   ├── leveraging-typescript.md
│   │   └── prevent-duplicate-function-addition.md
│   ├── styling/                             \# Styling related remarks
│   │   └── tailwind-color-configuration.md
│   └── testing/                             \# Specific testing tool configurations/issues
│       ├── component-stubbing-vue.md
│       ├── mocking-useRuntimeConfig-vitest.md
│       ├── nuxt-virtual-module-resolution.md
│       └── test-file-exclusion-and-aliases.md
├── patterns/                                \# In-depth explanations of architectural patterns
│   ├── api-service-layer-design.md
│   ├── domain-management-abstraction.md
│   ├── functional-programming-principles.md
│   ├── facade-pattern.md
│   ├── monads-either-maybe.md
│   └── why-separate-layers.md
├── presentations/                           \# Longer, presentation-style remarks or deep dives
│   ├── dto-advice-frontend.md
│   └── vue-form-validation-best-practices.md
├── npm/                                     \# NPM package related remarks and troubleshooting
│   ├── eslint-plugin-local-testing.md       \# Moved from remarks/testing
│   ├── npm-publish-troubleshooting.md       \# Moved from remarks/testing
│   └── stylelint-configuration.md           \# Moved from remarks/styling
├── utils/                                   \# General utility functions and classes
│   └── string-utils.ts
├── .commitlintrc.json                       \# Commitlint configuration
├── .editorconfig                            \# Editor style configuration
├── .gitignore                               \# Git ignore rules
├── package.json                             \# Project dependencies and scripts
├── package-lock.json                        \# npm lock file
├── README.md                                \# This document\! (The main entry point)
├── .prettierignore                          \# Prettier ignore file
└── .prettierrc.json                         \# Prettier configuration

```
