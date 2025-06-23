# NPM Publish Troubleshooting (For Juniors\!)

Imagine you've just baked a fantastic cake (your ESLint plugin\!). Now you want to share it with the world by putting it in a special bakery display case called **npm** (the Node Package Manager registry). People can then "buy" (install) your cake for their own projects.

But sometimes, getting your cake into that display case, or updating it, can be tricky. This guide talks about the common "struggles" or problems you might face when trying to `npm publish` your code, especially when you're just starting out with an ESLint plugin or any other package.

---

## 1\. The 24-Hour "No-Go" Rule: Deleting and Republishing

This is one of the trickiest and most frustrating rules, especially when you make a mistake right after publishing\!

**The Problem:**
You published your `my-eslint-plugin@1.0.0` to npm. Oh no\! You immediately found a typo or a small bug. Your first thought might be: "I'll just delete `1.0.0` from npm and publish it again with the fix\!"

If you try to do this (using `npm unpublish <package-name>@<version>`), and then immediately try to `npm publish` that _exact same version number_ (`1.0.0`) again, **npm will stop you\!** It will tell you:

`"You cannot publish over the previously published version <version>."`
`"It is no longer possible to unpublish a package after 72 hours, or if other packages depend on it."`
`"You must wait 24 hours to re-publish a deleted package with the same version number."`

**Why this rule exists (The Bakery's Reasons):**
Think about it from the "bakery" (npm registry) point of view:

- **Preventing Chaos:** If people could constantly delete and republish the _exact same version_, it would create huge confusion. Imagine someone installed `my-plugin@1.0.0` (the buggy one), and then you changed it. Their `package-lock.json` still says `1.0.0`, but now it points to different code. This would be a nightmare for consistency.
- **Caching:** When you publish, your package gets copied to many different "delivery trucks" (Content Delivery Networks, or CDNs) around the world so people can download it quickly. Also, package managers (like npm, yarn, pnpm) on users' computers keep "cached" copies. It takes time for all these caches to update or realize an old version is gone. The 24-hour rule gives these systems time to clear out the old, deleted package.
- **Dependency Stability:** What if another developer already published _their_ package that _depends_ on your `my-plugin@1.0.0`? If you suddenly delete `1.0.0`, their package breaks for everyone. npm wants to ensure stability for the entire ecosystem.

**What to do if you encounter it:**

- **The Golden Rule: NEVER `npm unpublish` unless absolutely critical.** If you published something wrong, it's almost always better to publish a **new, incremented version number**.

- **Publish a New Version:** This is the most common and correct solution.

  - Fix your bug.
  - Update the `version` in your `package.json` to the _next logical version_.
    - If it was `1.0.0` and you found a bug, make it `1.0.1` (patch version).
    - If it was `1.0.0` and you added a new small feature, make it `1.1.0` (minor version).
    - If it was `1.0.0` and you made big, breaking changes, make it `2.0.0` (major version).
  - Then `npm publish`.
  - This way, old users still get `1.0.0` (the buggy one, but it doesn't disappear from under them), and new users (or those who update) get `1.0.1` (the fixed one).

  ```bash
  # If you published 1.0.0 and it's buggy:
  # 1. Fix the code
  # 2. Update version in package.json from 1.0.0 to 1.0.1
  npm version patch # npm can help you increment the version!
  # 3. Publish the new version
  npm publish
  ```

- **Wait 24 hours:** If you _absolutely must_ republish the same version (e.g., in a very small, private package with no known dependencies), you literally have to wait a full 24 hours after the `npm unpublish` command before trying to `npm publish` that same version number again. This is rare and usually indicates a mistake in the release process.

> ### GitHub Note: Preventing the 24-Hour Wait with CI/CD
>
> This specific problem (needing to unpublish and wait) highlights why **Continuous Integration/Continuous Deployment (CI/CD)**, often using tools like **GitHub Actions**, is so crucial for package publishing.
>
> **How GitHub Actions Helps:**
>
> 1.  **Automated Testing:** Before any publish, your GitHub Actions workflow should run all your tests (unit, integration, linting). This catches most bugs _before_ they ever get published.
> 2.  **Automated Builds:** It ensures your code is always built correctly before it's packaged.
> 3.  **Automated Versioning & Publishing:** Tools like `Changesets` (discussed below) integrated with GitHub Actions can automatically determine the next version and publish, reducing human error.
>
> By setting up a robust CI/CD pipeline, you significantly reduce the chances of publishing a broken version, thereby almost eliminating the need to `npm unpublish` and encounter the frustrating 24-hour cooldown. Your `npm publish` process becomes a reliable, automated step after successful tests and builds.

---

## 2\. Managing Versions with `Changesets` (Your Release Diary)

When you're building a package, especially one that others use, keeping track of changes and versions can get complicated. This is where `Changesets` comes in – it's like a helpful assistant that automates a lot of the versioning and release notes work.

**What is `Changesets`?**
Imagine your project is a book, and every time you make a change (a bug fix, a new chapter, or a major rewrite), you want to write a little note about it. `Changesets` helps you write these notes (`.md` files) for each change. When it's time to publish a new version of your "book," `Changesets` reads all these notes, figures out the correct new version number, updates your `package.json`, and even creates a nice "What's New" (Changelog) file for you\!

**Why use `Changesets`?**

- **Automated Versioning:** No more guessing if it should be `1.0.1` or `1.1.0`. `Changesets` uses your notes to figure it out.
- **Automatic Changelogs:** It builds a "What's New" file for users, so they know exactly what changed in each release.
- **Clear Release Process:** It gives you a clear, repeatable process for releasing new versions.
- **Monorepo Friendly:** Super useful if you have one big project with many smaller packages inside it (a "monorepo").

**How to use `Changesets` (Basic Steps):**

1.  **Install it:**
    ```bash
    npm install @changesets/cli --save-dev
    ```
2.  **Initialize it (once per project):**
    ```bash
    npx changeset init
    ```
    This sets up some files and folders that `Changesets` needs.
3.  **Add a changeset (for every change you make):**
    When you fix a bug, add a feature, or make a breaking change, run:
    ```bash
    npx changeset add
    ```
    This command will ask you some questions:
    - Which packages are you changing?
    - What kind of change is it (patch, minor, major)?
    - Write a short summary of your change.
      It will then create a new `.md` file in a special folder.
4.  **Bump versions and create changelog:**
    When you're ready to prepare for a new release (after adding all your changesets):
    ```bash
    npx changeset version
    ```
    This command reads all your `.md` notes, figures out the new version numbers for your packages, updates `package.json` files, and generates or updates your `CHANGELOG.md` file. It then deletes the used `.md` notes.
5.  **Publish to npm:**
    After `npx changeset version` (and committing the changes it made\!), you can publish:
    ```bash
    npm publish # Or npx changeset publish if you have a monorepo
    ```
    You might also set up your CI/CD (like GitHub Actions) to do this automatically.

**Example `package.json` with Changesets:**
You'd typically add a script for `version` in your `package.json` for easy use:

```json
{
  "name": "my-eslint-plugin",
  // ...
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "changeset publish"
    // ... other scripts
  }
}
```

---

## 3\. Build/Transpilation Issues (The Invisible Broken Cake)

You write your ESLint plugin in TypeScript (or modern JavaScript features). But browsers and Node.js might not understand that code directly. You need to "build" or "transpile" it into a simpler JavaScript version.

**The Problem:**

- **Forgetting to Build:** You make changes, but forget to run your `npm run build` command before `npm publish`. You publish the _source code_ (e.g., `.ts` files) instead of the _compiled JavaScript_ that users actually need.
- **Incorrect `main`/`exports` in `package.json`:** Your `package.json`'s `main` field (or the newer `exports` field) points to a file that doesn't exist or isn't the correct entry point after building.

**What to do:**

- **Always Build First:** Make `npm run build` part of your publishing routine. Many projects add `prepublishOnly` script to `package.json`:
  ```json
  // package.json
  {
    "scripts": {
      "build": "tsc", // Or whatever your build command is
      "prepublishOnly": "npm run build" // This runs automatically before npm publish!
    }
  }
  ```
  This ensures your cake is always "baked" (built) before it goes into the display case.
- **Verify `main`/`exports`:**
  - Ensure your `package.json` `main` or `exports` field points to the correct _built_ file (e.g., `dist/index.js`).
  - If you're using modern modules (ESM) and CommonJS, explore the `exports` field in `package.json` for better control:
    ```json
    // package.json (example with exports)
    {
      "main": "./dist/index.cjs", // For CommonJS consumers
      "module": "./dist/index.mjs", // For ES module consumers
      "types": "./dist/index.d.ts", // For TypeScript type definitions
      "exports": {
        ".": {
          "require": "./dist/index.cjs",
          "import": "./dist/index.mjs",
          "types": "./dist/index.d.ts"
        }
      }
    }
    ```

---

## 4\. Missing Files in Published Package (The Empty Cake Box)

Sometimes, you publish, but the package that users download doesn't contain all the files it needs (e.g., your `dist` folder, or images, or additional config files).

**The Problem:**

- **Default `npm publish` behavior:** npm has rules about what it includes. It often ignores common development files (`node_modules`, `.git`, `package-lock.json`, etc.) by default.
- **`.npmignore`:** If you have a `.npmignore` file, it works like `.gitignore` but specifically for `npm publish`. You might accidentally include a rule that excludes necessary files.
- **`files` array in `package.json`:** If you use the `files` array in `package.json`, only the files/folders explicitly listed there will be included. If you forget to list your `dist` folder, it won't be published.

**What to do:**

- **Use `files` array:** This is the recommended and safest approach. Explicitly list all directories and files you _want_ to include.
  ```json
  // package.json
  {
    "name": "my-eslint-plugin",
    // ...
    "files": [
      "dist/", // Include your compiled output
      "rules/", // If your plugin has separate rule files
      "configs/", // If your plugin has separate config files
      "README.md",
      "LICENSE"
    ]
  }
  ```
  If `files` is present, npm ignores `.npmignore` (except for a few hardcoded exclusions).
- **Inspect `npm pack`:** Before publishing, run `npm pack` in your project root. This command creates a `.tgz` file (like `my-plugin-1.0.0.tgz`) that is _exactly_ what npm would publish. You can then open this `.tgz` file with a zip program and check if all your necessary files are inside. This is your "check the cake box" step\!
  ```bash
  npm pack
  # This will generate a file like: my-eslint-plugin-1.0.0.tgz
  # You can then open it with 7-Zip, WinRAR, etc., or explore it:
  # tar -tf my-eslint-plugin-1.0.0.tgz
  ```

---

## 5\. Authentication/Permissions (The Bakery Won't Let You In)

You need to be logged in to npm and have permission to publish to a package name.

**The Problem:**

- **Not Logged In:** You haven't run `npm login` in your terminal.
- **Incorrect User/Permissions:** You're logged in, but you don't have the right to publish to that specific package name (e.g., someone else owns `my-eslint-plugin`).

**What to do:**

- **Log In:**
  ```bash
  npm login
  ```
  Follow the prompts (username, password, email, OTP if 2FA enabled).
- **Check Access:** If you're trying to publish a public package and getting permission errors, make sure it's set to public:
  ```bash
  npm access public <your-package-name>
  ```
  If you're publishing a scoped package (e.g., `@myorg/my-plugin`), it defaults to private. To publish it publicly, use:
  ```bash
  npm publish --access public
  ```
  This needs to be done only once for the first publish of a new package name.

---

## 6\. Testing Your Package Locally (The Taste Test)

Before you publish your cake, you want to taste it to make sure it's good\! You need to test your package in a "real" project on your computer without actually publishing it to npm.

**The Problem:**

- You make changes, publish, and then realize it's broken only after another project tries to install it.

**What to do:**

- **`npm link` (For direct development):** This creates a "symlink" (a shortcut) from your local package project to another local project.

  1.  Go to your plugin's root folder: `cd /path/to/your/my-eslint-plugin`
  2.  Run `npm link`: This registers your plugin globally on your system.
  3.  Go to your "test" project's root folder: `cd /path/to/your/test-project`
  4.  Run `npm link eslint-plugin-my-plugin`: This creates a shortcut from `node_modules/my-eslint-plugin` to your actual plugin's folder.

  - **To unlink later:** In `test-project`, `npm unlink my-eslint-plugin`. In `my-eslint-plugin`, `npm unlink`.

- **`npm install <path>` (For quick checks):** You can also install your package directly from its file path.
  1.  Go to your "test" project's root folder: `cd /path/to/your/test-project`
  2.  Run `npm install /path/to/your/my-eslint-plugin`
- **`npm pack` + `npm install <tgz-file>` (Most realistic local test):** This is the best way to test exactly what npm will publish.

  1.  Go to your plugin's root folder: `cd /path/to/your/my-eslint-plugin`
  2.  Run `npm pack`. This creates the `.tgz` file.
  3.  Go to your "test" project's root folder: `cd /path/to/your/test-project`
  4.  Run `npm install /path/to/your/my-eslint-plugin-1.0.0.tgz` (use the exact name of the file `npm pack` created).

  - This is the closest simulation to what a user will experience when they `npm install` your package.

---

## 7\. Plugin "Flavors" (Different Cakes, Different Recipes\!)

Sometimes, your plugin might be useful in different "flavors" or configurations. For example, an ESLint plugin might offer a very strict "full" configuration, a more relaxed "recommended" one, and a super basic "minimal" one.

**Why create "Flavors"?**

- **Flexibility for Users:** Different projects have different needs. Some want all the rules, others just a few.
- **Easier Adoption:** A minimal config makes it easier for new users to try your plugin without being overwhelmed.
- **Clear Intent:** It helps you communicate what each configuration is for.

**How to make "Flavors" for your plugin:**

1.  **Separate Configuration Files:** Create separate files for each "flavor" of your configuration.

    - For an ESLint plugin, you might have:
      - `index.js` (for the full/default config)
      - `recommended.js`
      - `minimal.js`
      - And for Stylelint configurations, you'd put them in a dedicated folder, like `stylelint/index.js`, `stylelint/recommended.js`, `stylelint/minimal.js`.
        (See `stylelint_flavors_code` for an example of this structure for Stylelint.)

2.  **`package.json` `exports` field:** This is the _magic ingredient_ that tells npm (and package managers like npm/Yarn/pnpm) how to find your different "flavors." It allows users to "import" or "require" specific parts of your package.

    ```json
    // package.json (example)
    {
      "name": "eslint-config-epsvue",
      "version": "1.1.0",
      "main": "index.js", // Main entry point for the default ESLint config
      "exports": {
        ".": "./index.js", // Users can import 'eslint-config-epsvue' for the full config
        "./recommended": "./recommended.js", // Users import 'eslint-config-epsvue/recommended'
        "./typescript": "./typescript.js", // Users import 'eslint-config-epsvue/typescript'
        "./minimal": "./minimal.js", // Users import 'eslint-config-epsvue/minimal'
        "./stylelint": "./stylelint/index.js", // Users import 'eslint-config-epsvue/stylelint' (default stylelint config)
        "./stylelint/recommended": "./stylelint/recommended.js", // Users import 'eslint-config-epsvue/stylelint/recommended'
        "./stylelint/minimal": "./stylelint/minimal.js" // Users import 'eslint-config-epsvue/stylelint/minimal'
      },
      "files": [
        "index.js",
        "recommended.js",
        "typescript.js",
        "minimal.js",
        "stylelint" // Include the whole stylelint directory so its files are published
      ]
      // ... other fields
    }
    ```

    - The `exports` field makes your different configuration files directly discoverable and importable by users. For example, a user could do `import epsvueRecommended from 'eslint-config-epsvue/recommended';`.
    - **`main` field:** This is the default file that gets loaded if someone just does `require('your-package')`. It should usually point to your "full" or most common configuration.
    - **`files` field:** Remember to list all your flavor files and directories (like `stylelint/`) in the `files` array of your `package.json`. If you don't, npm won't include them in the published package, and users won't be able to find them\!

By offering different "flavors" and using the `exports` field, you make your plugin more versatile and user-friendly\!

---

## 8\. Linting Your Own Plugin's Code (Making Your Cake Recipe Perfect\!)

You're making an ESLint plugin (`eslint-config-epsvue`), which itself is code\! Just like you lint other projects, it's super important to lint the code _inside_ your plugin to ensure it's high quality, consistent, and free of errors. This is like making sure your cake recipe itself is perfectly written and easy to follow.

**Why lint your plugin's code?**

- **Quality Control:** Ensures your plugin code (rules, configurations) adheres to best practices.
- **Consistency:** Maintains the same coding style within the plugin as you enforce in other projects.
- **Prevent Bugs:** Catches typos, potential logical errors, and deprecated syntax within your plugin's rules or config.
- **Maintainability:** Clean, well-linted code is easier for you and others to understand and update in the future.

**How to lint your plugin's code (`eslint-config-epsvue`):**

The great news is that your `coding-remarks` repository's ESLint setup (`eslint.config.js`) is already powerful enough to lint your plugin's files\! You just need to ensure your plugin's file types are covered.

Your plugin, `eslint-config-epsvue`, likely contains:

- `.js` files (for ESLint rules and configs)
- Potentially `.ts` files (if you write rules in TypeScript)
- Potentially `.vue` files (if you have demo components or very specific Vue-related linting)

Your existing `eslint.config.js` already includes `**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}` in its `files` array, which means it **will automatically lint these file types** within your `eslint-config-epsvue` directory (assuming it's a subfolder in `coding-remarks` or your lint command covers it).

**What to ensure in your `eslint.config.js` for plugin code:**

1.  **Node.js Environment:** Your ESLint plugin files (like `index.js`, `recommended.js`, `rules/*.js`) run in a Node.js environment. Make sure your main ESLint config has `env.node: true` (which it does) or `globals.node` in the flat config (`eslint.config.js` `languageOptions.globals`). This ensures Node.js global variables like `module` and `require` are recognized.

2.  **CommonJS vs. ES Modules:** ESLint plugin files traditionally use CommonJS (`module.exports`). Your `eslint.config.js` (being an ES Module) can handle both, but your plugin's own files should stick to the module system you intend for them. Since `eslint-config-epsvue` targets users' ESLint setups, it might use CommonJS (`module.exports = { ... }`). This is perfectly fine; your `eslint.config.js` handles it.

3.  **`eslint-plugin-eslint-plugin` (Optional, Advanced):** For a very strict linting of ESLint plugins themselves, there's a specialized ESLint plugin called `eslint-plugin-eslint-plugin`. It checks for common mistakes _when writing_ ESLint rules and configs. You could add this to your `eslint.config.js` if you want to be extra rigorous about the quality of your plugin's internal code.

    - **Installation:** `npm install --save-dev eslint-plugin-eslint-plugin`
    - **Usage in `eslint.config.js`:**

      ```javascript
      import globals from "globals";
      // ... other imports
      import eslintPluginEslintPlugin from "eslint-plugin-eslint-plugin"; // NEW IMPORT

      export default tseslint.config(
        {
          // ... your existing main config block for files like .js, .ts, .vue
          extends: [
            // ... existing extends
            eslintPluginEslintPlugin.configs["recommended"], // Add this line
          ],
          // ...
        },
        // ... your existing prettier, markdown overrides
      );
      ```

By running `npm run lint` or `npm run lint:fix` in your `coding-remarks` repository, ESLint will automatically traverse and lint the files within your `eslint-config-epsvue` directory, enforcing the same high standards you set for your other code.

---

## General Advice to Avoid Future Struggles

- **Test Locally, Always:** Use `npm pack` and local installation before `npm publish`.
- **Use Version Control (Git):** Every change should be in Git. If you mess up a publish, you can always revert your code.
- **Start with `0.0.1`:** For new packages, start with very small version numbers (`0.0.1`, `0.0.2`, etc.) so you have room to increment without hitting major versions too quickly while you're still figuring things out.
- **Semantic Versioning (`SemVer`):** Learn about Major.Minor.Patch (`1.2.3`).
  - **Patch (`1.2.x` to `1.2.y`):** For bug fixes that don't break anything. (`npm version patch`)
  - **Minor (`1.x.x` to `1.y.x`):** For new features that are backwards-compatible (don't break existing code). (`npm version minor`)
  - **Major (`x.y.z` to `a.b.c`):** For changes that _break_ existing code (users will need to change their code to use your new version). (`npm version major`)
- **CI/CD Automation:** Set up GitHub Actions (as we discussed) to automatically build, test, and even publish your package. This takes human error out of the equation.

By understanding these common struggles and adopting these practices, your journey of publishing and maintaining npm packages will be much smoother\!
