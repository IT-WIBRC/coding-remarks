# Git Workflow & Hooks (`pre-commit` and `pre-push` Strategy)

This document outlines recommended strategies for implementing `pre-commit` and `pre-push` Git hooks in professional projects to maintain code quality and a clean Git history. It also includes recommendations for a corresponding CI/CD pipeline.

---

## 1. `pre-commit` Hook Recommendations

### Recommended Actions

- **Linter & Formatter:**
  - **Advantages:** Ensures consistent code style, catches basic syntax errors, and enforces best practices _before_ code enters Git history. This significantly reduces noise in code reviews.
  - **Implementation:** Utilize tools like `lint-staged` combined with `husky`. `lint-staged` runs linters/formatters only on the staged files, which keeps the hook fast and efficient.
- **TypeScript Type Checking (`tsc --noEmit`):**
  - **Advantages:** Checks for TypeScript compilation errors _without_ actually generating output. This is significantly faster than running a full build and provides crucial early feedback on type correctness, serving as a vital "stability" check at the commit stage without performance penalty.
  - **Implementation:** Add `tsc --noEmit` to your `pre-commit` hook configuration.

### Summary of Recommended `pre-commit` actions:

1.  Lint staged files (e.g., using `eslint --fix`).
2.  Format staged files (e.g., using `prettier --write`).
3.  Run TypeScript type checking (`tsc --noEmit`).

---

## 2. `pre-push` Hook Recommendations

### Recommended Actions

- **Unit Tests:**
  - **Advantages:** Ensures that you are not pushing code that breaks existing functionality. It acts as a last line of defense, providing immediate feedback before your changes are shared with the team.
  - **Implementation:** Configure your test runner (e.g., Vitest) to run unit tests. Optimize it to run quickly (e.g., only affected files, or all unit tests if the suite is fast enough).
- **Commit History Management (via Pull Request Workflow with Squashing):**
  - **Concept:** Encourage developers to make frequent, small, atomic commits locally. This is beneficial for granular progress tracking, detailed local history, and providing safe rollback points during development. A "clean history" (e.g., one logical commit per feature or bug fix) in shared branches is achieved through **squashing** multiple small commits into a single, well-described commit _before_ merging.
  - **Implementation:**
    - Promote frequent local commits on feature branches.
    - Utilize `git rebase -i` or the "squash and merge" features available on platforms like GitHub/GitLab as part of your Pull Request (PR) workflow.
  - **`pre-push` for Branch Rules (Optional but common):**
    - **Purpose:** Enforce repository-level branch protection rules.
    - **Examples:** Preventing pushes directly to protected branches (`main`, `develop`), ensuring commit message format (if using Conventional Commits), or validating branch naming conventions.

### Summary of Recommended `pre-push` actions:

1.  Run unit tests (e.g., `vitest run --passWithNoTests`).
2.  (Optional) Enforce branch protection rules (e.g., disallowing direct pushes to `main` or specific branch patterns).

---

## 3. Corresponding CI/CD Pipeline Recommendations

While Git hooks are client-side safeguards that provide immediate feedback, a robust CI/CD (Continuous Integration/Continuous Deployment) pipeline is essential for server-side enforcement, comprehensive quality checks, and automated delivery. CI/CD acts as the ultimate gatekeeper for your codebase.

### Recommended CI/CD Stages

- **On Pull Request (PR) Creation/Update (e.g., `pull_request` workflow trigger):**

  - **Full Linting & Formatting Check:** Run linters and formatters across the _entire codebase_ (not just staged files from the commit) to catch any issues missed by `pre-commit` or in older code. This ensures the entire branch adheres to code standards before merging.
  - **Full Type Checking:** Run `tsc --noEmit` across the entire project to ensure complete type correctness.
  - **Run All Unit Tests:** Execute the complete suite of unit tests to confirm no regressions.
  - **Run Integration Tests:** Execute integration tests to verify interactions between different modules and services.
  - **Build Verification:** Run a full production build (`npm run build` or `nuxt build`) to ensure the application compiles correctly and can be deployed. This catches any build-time errors.
  - **Security Scans (Optional but Recommended):** Integrate tools to scan for known vulnerabilities in your project's dependencies (e.g., `npm audit`, Snyk, Dependabot).
  - **Code Coverage Check:** Enforce a minimum code coverage threshold to ensure adequate test coverage.

- **On Merge to `develop` or `main` (or other deployment branches - e.g., `push` workflow trigger on specific branches):**

  - **Deployment to Staging/Pre-production:** Automatically deploy the successfully built artifact to a staging environment. This environment is crucial for further testing (e.g., manual QA, stakeholder review, automated End-to-End tests).
  - **End-to-End (E2E) Tests:** Execute comprehensive E2E tests against the deployed staging environment to simulate real user scenarios and verify critical user flows.
  - **Performance Audits (Optional):** Integrate tools like Lighthouse or WebPageTest to run automated performance audits on the deployed environment.

- **On Merge to `main` (Production Deployment - often a separate workflow or a later stage in the main one):**
  - **Production Build (if not already built and cached):** Create a fresh, optimized production build specific for the final deployment.
  - **Automated Deployment:** Automatically deploy the validated artifact to the production environment upon successful completion of all prior quality gates.
  - **Rollback Strategy:** Ensure a clear and quick rollback strategy is defined and readily executable in case of post-deployment issues.

### Why CI/CD is Crucial Even with Git Hooks

- **Server-Side Enforcement:** Git hooks can be bypassed or might not be configured identically for all developers. CI/CD ensures consistent, mandatory quality checks regardless of local setup.
- **Comprehensive Checks:** CI/CD environments typically have more robust resources to run longer, more exhaustive tests (integration, E2E, full builds, complex analysis) that would be too slow or resource-intensive for local hooks.
- **Collaboration & Visibility:** Provides a clear status for all branches and pull requests across the team, facilitating efficient code reviews and preventing broken code from entering shared branches.
- **Automated Deployment:** Automates the release process, significantly reducing manual error, speeding up delivery, and ensuring a consistent deployment process.
