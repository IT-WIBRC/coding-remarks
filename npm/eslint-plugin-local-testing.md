# Testing Your ESLint Plugin Locally with NPM (The Real Talk for Juniors\!)

Imagine you're baking a new kind of bread (your ESLint plugin\!). Before you sell it, you need to taste it. But testing an ESLint plugin locally in another project can feel like trying to taste your bread without being allowed to take it out of the oven\! It's tricky because the plugin needs to be "installed" in the test project, just like a real user would install it from npm.

This guide talks about the common struggles you might face when trying to see if your ESLint plugin actually works in a real project on your computer, and some practical (sometimes messy) ways to get it done.

---

## 1\. Why Local Testing Is Tricky for ESLint Plugins

Your ESLint plugin (`eslint-config-epsvue`) is designed to be installed by other projects. When you're _making_ the plugin, you need to see if your new rules or configurations actually catch errors or suggest fixes in a _different_ project.

The challenge is getting your unfinished plugin from your "development folder" into the `node_modules` folder of your "test project" in a way that lets you see changes instantly.

---

## 2\. The "Ideal" Tool: `npm link` (The Direct Shortcut)

`npm link` is supposed to be the perfect tool for local development. It creates a special "shortcut" (called a symlink) that tricks your test project into thinking it has installed your plugin from npm, when in reality, it's just looking at your plugin's development folder.

**How `npm link` is _supposed_ to work:**

1.  **Go to your plugin's folder:** Open your terminal and go into the `eslint-config-epsvue` folder (where your plugin's `package.json` is).
    ```bash
    cd /path/to/your/eslint-config-epsvue
    ```
2.  **Make your plugin globally available (as a shortcut):**
    ```bash
    npm link
    ```
    This command registers your plugin globally on your computer, so other projects can find it.
3.  **Go to your test project's folder:** Switch your terminal to the project where you want to test your ESLint plugin.
    ```bash
    cd /path/to/your/test-project # This is a project that uses ESLint
    ```
4.  **Link your plugin into the test project:**
    ```bash
    npm link eslint-config-epsvue
    ```
    This creates the shortcut: now, `node_modules/eslint-config-epsvue` in your test project actually points directly to your plugin's development folder\!

**The Promise of `npm link`:**
With this setup, when you make a change in your plugin's development folder, you'd _hope_ that ESLint in your test project would immediately see those changes when you run it (e.g., `npx eslint .`). This would be fantastic for quick testing\!

---

## 3\. The Real-World Struggle: `npm link` and the "Hot Reload" Problem

Here's where the frustration often begins, as I experienced when developing my plugin:

**The Problem:**
Even with `npm link`, when you make a change in your plugin's code (e.g., you fix a rule or add a new one), ESLint in your test project often **doesn't immediately pick up those changes\!** You run `npx eslint .` in your test project, and it still acts like the old version of your plugin.

- **Why it happens:** `npm link` creates a folder shortcut, but tools like ESLint might still load modules in a way that doesn't "hot reload" changes from the linked folder. They often cache the module, or the build process of your plugin isn't being triggered correctly by `npm link` to update the actual JavaScript files that ESLint consumes.
- **The Frustration:** This means you have to constantly re-run commands, rebuild your plugin, and sometimes even restart your editor or the ESLint server, just to see if a tiny change worked. This slows down your development to a crawl\!

## 4\. The "Hacky" Workaround: Directly Editing `node_modules`

Because `npm link` often fails to give you that instant feedback, a common (but generally **bad practice**\!) workaround for quick, desperate testing is to directly edit the plugin's code **inside the `node_modules` folder of your test project**.

**How this "hack" works (and why it's not ideal):**

1.  **Find the installed plugin:** In your test project, go into `node_modules/eslint-config-epsvue`.
2.  **Make changes directly:** You might open the `index.js` or `rules/my-new-rule.js` file _inside that `node_modules` folder_ and directly edit the code there.
3.  **Instant Feedback (sometimes\!):** When you run ESLint in your test project, it _might_ pick up these changes immediately because it's loading the files directly from its own `node_modules`.

**Why it's a "hack" and not a proper solution:**

- **Temporary:** Changes made in `node_modules` are _not_ in your actual plugin's source code. If you delete `node_modules` and reinstall, all your changes are lost\!
- **Fragile:** It's easy to make mistakes directly editing installed code.
- **Not Reproducible:** Your teammates won't have these changes. It's a "fix" just for your machine in that moment.

**My Struggle:**
When I was developing `eslint-config-epsvue`, I often hit this wall. `npm link` didn't give me the instant feedback I needed. To quickly test if a rule fix or a new rule pattern actually worked, I would often resort to this `node_modules` hack. I'd make a change, run ESLint in the test project, see if it worked, adjust directly, and repeat. This was very inefficient but sometimes the only way to get rapid validation during the rule development phase.

---

## 5\. The "Copy-Paste" Solution (From Hack to Source)

Once you've done the `node_modules` hack and finally get your rule or config working perfectly _inside the `node_modules` folder_:

**The Solution:**
You **copy the working code** from `node_modules/eslint-config-epsvue` and **paste it back into your actual plugin's development folder** (`/path/to/your/eslint-config-epsvue`).

This ensures that the correct, working code is now in your source files, ready to be saved by Git and eventually published to npm.

**My Experience:**
This became a frequent part of my workflow for complex rule development. It felt clunky – like there should be a better way to live-edit a plugin's behavior and see its effects. Unfortunately, for some specific use cases like ESLint plugin development, a truly seamless "hot-reload" experience via `npm link` remains a challenge that npm doesn't natively offer a clean solution for.

---

## 6\. More Reliable Local Testing: `npm pack` (The "Sealed Box" Test)

While the `npm link` workaround and `node_modules` hack are about live development, `npm pack` is the best way to simulate what a user will actually install from npm.

**How `npm pack` works:**

1.  **Go to your plugin's folder:**
    ```bash
    cd /path/to/your/eslint-config-epsvue
    ```
2.  **Create a `.tgz` file:**
    ```bash
    npm pack
    ```
    This command creates a compressed file (like `eslint-config-epsvue-1.0.0.tgz`) in your plugin's folder. This `.tgz` file contains _exactly_ what would be published to npm.
3.  **Go to your test project's folder:**
    ```bash
    cd /path/to/your/test-project
    ```
4.  **Install the `.tgz` file:**
    ```bash
    npm install /path/to/your/eslint-config-epsvue-1.0.0.tgz
    ```
    This installs your plugin from the local `.tgz` file, just like it would from the npm registry.

**Why it's important:**

- **Real-world Simulation:** This is the closest you can get to how a user will experience your plugin. It checks if your `package.json`'s `main`, `exports`, and `files` fields are correct.
- **Catches Packaging Errors:** It helps you find out if you forgot to include necessary files in your package (a common problem, as discussed in the `npm-publish-troubleshooting.md`\!).

---

## General Advice for Plugin Development

- **Write Tests for Your Rules\!** While local testing in a project is important, the most efficient way to develop and ensure your ESLint rules work correctly is to write dedicated **unit tests** for each rule _within your plugin's project_. This is much faster and more reliable for verifying the core logic of your rules.
- **Be Patient with `npm link`:** Understand its limitations. It's great for some scenarios, but not always for instant feedback with complex tools like ESLint.
- **Prioritize `npm pack` for "Release Readiness":** Always use `npm pack` to verify your final package before publishing.

By understanding these local testing struggles and the tools available, you can navigate the development of your ESLint plugin more effectively\!
