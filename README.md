# Coding Remarks: Best Practices & Architectural Guidelines

This repository serves as a personal compendium of coding best practices, architectural guidelines, and valuable development remarks. It documents lessons learned and preferred approaches gathered across various programming languages and frameworks, including JavaScript, TypeScript, Vue.js, and Nuxt.js. This collection is a quick reference and a living record of my evolving understanding of software development.

The goal is to foster consistent, maintainable, and testable code, serving as a quick reference and a living record of my evolving understanding of software development. **For a broader collection of development and IT resources, including articles, tutorials, and tools, be sure to check out the [Dev and IT Resource project](https://github.com/masterivanic/Dev-and-it-ressource).**

---

## Table of Contents

- [Core Principles & General Advice](#core-principles--general-advice)
- [Architectural Patterns & Design Choices](#architectural-patterns--design-choices)
- [Language & Framework Specific Remarks](#language--framework-specific-remarks)
- [Utilities](#utilities)
- [Composables](#composables)
- [Useful Tools & Resources](#useful-tools--resources)
- [Testing Strategies & Tooling](#testing-strategies--tooling)
- [Presentation-Style Remarks](#presentation-style-remarks)
- [NPM Package Management & Publishing](#npm-package-management--publishing)
- [Repository Structure](#repository-structure)

---

## Core Principles & General Advice

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
- [** Why Foundational Skills Still Matter in the Age of Frameworks and AI
  **](./remarks/general/foundational-skills.md)
  - The importance of understanding core programming concepts.
  - How frameworks and AI can abstract away complexity, but foundational skills are still crucial.
  - Examples of how foundational skills help in debugging, optimization, and architecture decisions.

---

## Architectural Patterns & Design Choices

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

- [**Learning the Single Responsibility Principle, One Test at a Time**](./patterns/tdd-to-srp.md)
  - Applying Test-Driven Development (TDD) to understand and implement the Single Responsibility Principle (SRP).
  - How writing tests first can guide you to create classes and functions with a single, well-defined purpose.
  - Refactoring examples to improve code structure and adhere to SRP.

---

## Language & Framework Specific Remarks

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

## Utilities

This section contains practical utility classes that demonstrate various coding patterns and provide reusable solutions for common tasks.

- [**String Utilities (Fluent API)**](./utils/string-utils.ts)
  - **Description:** This utility class provides a set of common string manipulation methods (like `capitalize`, `toLowerCase`, `trim`, `replace`, etc.) designed to be **chainable**. It also includes helpful validation methods such as `isEmpty`, `isLessThan`, `isMoreThan`, and `isEqual`.
  - **Key Learning Points:** Fluent API / Method Chaining, Static Factory Methods, Encapsulation, and Practical String Manipulation & Validation.
- [**Number Utilities (Fluent API)**](./utils/number-utils.ts)
  - **Description:** This utility class provides a set of common number manipulation methods (like `add`, `multiply`, `toFixed`, `round`, etc.) designed to be **chainable**. It also includes helpful validation methods such as `isZero`, `isLessThan`, `isMoreThan`, `isEqual`, `isBetween`, `isEven`, `isOdd`, `isFinite`, and `isDivisibleBy`.
  - **Key Learning Points:** Fluent API / Method Chaining, Static Factory Methods, Encapsulation, and Practical Number Manipulation & Validation.
- [**Money Utilities (Fluent API & Precision)**](./utils/money-utils.ts)
  - **Description:** This utility class provides a set of common **monetary calculation and formatting** methods (like `add`, `subtract`, `multiply`, `divide`, `toPercentage`, `format`, etc.) designed to be **chainable**. It internally handles monetary values as **integers (e.g., cents)** to meticulously avoid floating-point inaccuracies.
  - **Key Learning Points:** Fluent API / Method Chaining, Static Factory Methods, Encapsulation, and Precision in Financial Calculations.
- [**Boolean Utilities (Fluent API & Logic)**](./utils/boolean-utils.ts)
  - **Description:** This utility class provides a set of common **logical operations and validation methods** for boolean values (like `and`, `or`, `not`, `xor`, `isTrue`, `isFalsy`, etc.) designed to be **chainable**. It handles various input types, converting them to their boolean equivalent for operations.
  - **Key Learning Points:** Fluent API / Method Chaining, Static Factory Methods, Encapsulation, and Practical Logical Operations & Validation.

---

## Composables

This folder contains a collection of reusable, reactive composable functions for Vue.js applications. Each composable is designed to be lightweight and independent, allowing you to use them without adding a large library as a dependency.

- [**`useBreakpoints`**](./composables/useBreakpoints/README.md)
  - **Description:** A composable for checking the current window's screen size based on predefined breakpoints. It's a reactive solution to handle responsive design without manually managing `resize` event listeners.

---

## Useful Tools & Resources

This document serves as a curated list of valuable tools and resources that can significantly enhance various aspects of software development, design, and productivity.

- [**Useful Tools and Resources**](./remarks/general/useful-tools-and-resources.md)
  - **Description:** A comprehensive list of external tools and resources categorized by their utility (e.g., Email & SMTP Testing, Diagramming, Career & Resume Building, Web Development & Database Tools, AI & Document Interaction). Each entry provides a brief description and relevant keywords for quick discovery.
  - **Keywords:** Developer tools, web development resources, software engineering tools, productivity tools, design tools, AI tools, database tools, email testing, diagramming, resume builder.
- **Pramp**: A platform for practicing coding interviews with peers. It offers a structured way to practice technical interviews, including system design and behavioral questions, by pairing you with other developers for mock interviews. [Link](https://www.pramp.com/)

---

## Testing Strategies & Tooling

Insights into testing methodologies and specific tool configurations.

- [Component Stubbing in Vue Tests](./remarks/testing/component-stubbing-vue.md)
- [Mocking `useRuntimeConfig` in Nuxt.js with Vitest](./remarks/testing/mocking-useRuntimeConfig-vitest.md)
- [Resolving Nuxt 3 Virtual Module Errors in Vitest (`#app` etc.)](./remarks/testing/nuxt-virtual-module-resolution.md)
- [**Test File Exclusion and Alias Resolution (Nuxt.js/Vite/Vitest)**](./remarks/testing/test-file-exclusion-and-aliases.md)
  - Vite's conventional exclusion of test files.
  - Alias and auto-import issues in test files.
  - IDE behavior differences.
- [**Testing Reactive Composables in Nuxt & Vitest: Overcoming Mocking Challenges**](./remarks/testing/vitest-nuxt-reactive-mocks.md)
  - Vitest's strict matchers (`toBe`, `toEqual`, `toStrictEqual`).
  - The "different instances" problem with reactive mocks in Nuxt/Vitest.
  - Why global mocks in `vitest.setup.ts` can fail for reactive state.
  - A robust pattern for centralizing singleton mocks and applying them locally.

---

## Presentation-Style Remarks

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

## NPM Package Management & Publishing

This section covers common challenges and best practices related to managing, versioning, and publishing NPM packages, including strategies for testing and structuring reusable plugin "flavors."

- [**NPM Publish Troubleshooting**](./npm/npm-publish-troubleshooting.md)
  - The 24-hour "no-go" rule for deleting and republishing.
  - Managing versions with `Changesets` (automated versioning and changelogs).
  - Handling build and transpilation issues.
  - Ensuring all necessary files are included in the published package.
  - Authentication and permissions for publishing.
  - Strategies for local package testing (`npm link`, `npm pack`).
  - Creating plugin "flavors" using `package.json` `exports` for different configurations.
- [Linting Your Own Plugin's Code (`eslint-config-epsvue`)](./npm/npm-publish-troubleshooting.md)
  - Maintain high quality by using a consistent ESLint configuration for your published plugin.
- [Test Your npm plugin locally](./npm/eslint-plugin-local-testing.md)
  - How to effectively test your code locally before publishing to NPM.

---

## Repository Structure

This section outlines the current directory and file structure for the `coding-remarks` repository itself.

```
.
├── .git/                                    # Git version control directory
├── .github/                                 # GitHub specific configurations (e.g., workflows)
│   ├── workflows/
│   |    └── ci.yml                           # GitHub Actions CI workflow (npm-based)
│   └── pull_request_template.md
├── .husky/                                  # Git hooks managed by Husky
│   ├── pre-commit                           # Runs lint-staged
│   ├── commit-msg                           # Runs commitlint
│   └── _/                                   # Husky internal directory
├── .vscode/                                 # VS Code editor settings (optional)
│   └── settings.json
├── composables/                             # Vue.js composables for reusable logic
│   ├── useBreakpoints/
|   |  ├── index.ts                           # The code for the composable
│   |  └── README.md                          # Documentation for the composable
|   └── README.md
├── npm/                                     # NPM package related remarks and troubleshooting
│   ├── eslint-plugin-local-testing.md
│   ├── npm-publish-troubleshooting.md
│   └── stylelint-configuration.md
├── patterns/                                # In-depth explanations of architectural patterns
│   ├── api-service-layer-design.md
│   ├── domain-management-abstraction.md
│   ├── facade-pattern.md
│   ├── functional-programming-principles.md
│   ├── monads-either-maybe.md
│   ├── tdd-to-srp.md
│   └── why-separate-layers.md
├── presentations/                           # Longer, presentation-style remarks or deep dives
│   ├── dto-advice-frontend.md
│   └── vue-form-validation-best-practices.md
├── remarks/                                 # Categorized general coding remarks
│   ├── general/                             # General coding advice details
│   │   ├── ai-learning-caution.md
│   │   ├── editorconfig.md
│   │   ├── foundational-skills.md
│   │   ├── general-coding-principles.md
│   │   ├── git-workflow-hooks.md
│   │   ├── github-actions-ci-recommendations.md
│   │   └── useful-tools-and-resources.md
│   ├── styling/                             # Styling related remarks
│   │   └── tailwind-color-configuration.md
│   ├── testing/                             # Specific testing tool configurations/issues
│   │   ├── component-stubbing-vue.md
│   │   ├── mocking-useRuntimeConfig-vitest.md
│   │   ├── nuxt-virtual-module-resolution.md
│   │   ├── test-file-exclusion-and-aliases.md
│   │   └── vitest-nuxt-reactive-mocks.md
│   ├── typescript-javascript/               # TypeScript & JavaScript specific remarks
│   │   ├── async-await-explained.md
│   │   ├── leveraging-typescript.md
│   │   └── prevent-duplicate-function-addition.md
│   └── vue-nuxt/                            # Vue.js & Nuxt.js specific remarks
│       ├── composable-utility-export-pattern.md
│       ├── module-import-style.md
│       ├── pinia-store-encapsulation.md
│       ├── reactivity-shallowref.md
│       └── store-usage-scope.md
├── utils/                                   # General utility functions and classes
│   ├── boolean-utils.ts
│   ├── money-utils.ts
│   ├── number-utils.ts
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
