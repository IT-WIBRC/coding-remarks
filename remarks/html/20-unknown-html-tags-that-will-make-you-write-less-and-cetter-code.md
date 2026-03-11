# 20 Unknown HTML Tags That Will Make You Delete Your Custom Components

Ah, the classic developer trap.

We spend days fighting with CSS transitions, ARIA roles, and `useState` toggles for a custom "accordion" or "progress bar," only to find out the W3C solved this a decade ago while we weren't looking. 😅

I’ll admit it—I’ve been that dev. I’ve built "div-soups" that looked like a search bar to me but meant absolutely nothing to a screen reader.

But here is the truth: **The best code is the code you don’t have to write.**

Alright, enough intro. Let’s look at the tags that are going to make your DOM way smarter.

---

## 🌐 The Semantic SEO Power-Ups

### 🔍 `<search>`

**What problem it solves:**
For years, we just wrapped search forms in a generic `<div>`. Screen readers had no native way to identify "This is the search part of the app" without adding manual `role="search"`.

**Old way:**

```html
<div role="search">
  <form>...</form>
</div>
```

**Now:**

```html
<search>
  <form action="/search">
    <input name="q" />
  </form>
</search>
```

### 📅 `<time>`

**What problem it solves:**
Search engines are smart, but they aren't psychics. If you write "Next Monday," they don't know the specific date.

**Now:**

```html
<time datetime="2026-03-11">March 11th</time>
```

**Why it matters:** Massive SEO win. It allows search engines to index your events or post dates accurately.

### 📍 `<address>`

**What problem it solves:**
It’s not just for physical mail! It’s for the _contact information_ of the nearest `<article>` or the whole document.

**Now:**

```html
<address>Contact the author at <a href="mailto:hi@ficus.app">hi@ficus.app</a></address>
```

---

## 🛠️ Data & Precision Layout

### 📊 `<meter>` vs. `<progress>`

**The Confusion:**
Most devs use `<progress>` for everything. But they have two completely different semantic jobs.

**Now:**

```html
<progress value="70" max="100"></progress>

<meter min="0" max="100" low="30" high="80" optimum="90" value="95"></meter>
```

**Why it matters:** A screen reader announces `<progress>` as "Loading..." but announces `<meter>` as a "Gauge." Using the right one prevents user confusion.

### 🏷️ `<data>` & `<abbr>`

**The Problem:**
You have a price or a product ID that looks great to a human, but a computer has no idea what the "Machine-readable" version is.

**Now:**

```html
<data value="7721">Premium Subscription</data>

<p>I love <abbr title="Cascading Style Sheets">CSS</abbr>!</p>
```

**Why it matters:** `<data>` links a human-readable name to a machine-readable value (great for web scrapers). `<abbr>` ensures screen readers can explain what an acronym stands for.

### 🖼️ `<figcaption>`

**The Old Way:**

```html
<div class="img-box">
  <img src="cat.jpg" />
  <p>A cute cat</p>
</div>
```

**Now:**

```html
<figure>
  <img src="cat.jpg" alt="Orange tabby sleeping" />
  <figcaption>Fig 1: Simba, after a long day of doing nothing.</figcaption>
</figure>
```

---

## ✍️ Precision Typography (The "Grammar" Tags)

### 📝 `<ins>` & `<del>`

**The Problem:**
Showing "Track Changes" or a sale price. Usually, we just use CSS `text-decoration: line-through`.

**Now:**

```html
<p>The price is <del>$50</del> <ins>$30</ins>!</p>
```

**Why it matters:** A screen reader will say "Deleted: 50 dollars. Inserted: 30 dollars." If you only use CSS, a blind user just hears "50 dollars 30 dollars."

#### 💡 `<mark>` & `<dfn>`

**Now:**

```html
<p>The <dfn id="html-def">HTML</dfn> is the backbone of the web.</p>
<p>You searched for <mark>backbone</mark>.</p>
```

**Why it matters:** `<dfn>` identifies the _defining instance_ of a term for SEO. `<mark>` means "relevant to the user's current activity" (like search highlights).

### ⌨️ `<kbd>` & `<code>`

**Now:**

```html
<p>Press <kbd>Cmd</kbd> + <kbd>S</kbd> to save your <code>function</code>.</p>
```

**Why it matters:** It distinguishes between what the user _does_ (`kbd`) and what the computer _shows_ (`code`).

### 💎 `<ruby>` (with `<rt>` and `<rp>`)

**What it is:** Annotations for pronunciation, usually for East Asian characters.
**Example:**

```html
<ruby>漢 <rt>かん</rt></ruby>
```

---

## 🎭 Interactive & Internationalization

### 📂 `<details>` & `<summary>`

**The Problem:**
Building an "Accordion" usually requires 50 lines of JS.

**Now:**

```html
<details>
  <summary>What is Ficus?</summary>
  C'est une plateforme pour tester vos connaissances en dev !
</details>
```

**Why it matters:** Zero JavaScript. It’s accessible and keyboard-navigable by default.

### ↔️ `<bdi>` & `<bdo>`

**Now:**

```html
<ul>
  <li>User <bdi>إيان</bdi>: 15 points</li>
  <li>User <bdi>Ian</bdi>: 12 points</li>
</ul>
```

**Why it matters:** `<bdi>` (Bi-Directional Isolation) prevents right-to-left text (like Arabic) from messing up the layout of the surrounding left-to-right text.

### 🔌 `<output>`

**Now:**

```html
<form oninput="res.value=parseInt(a.value)+parseInt(b.value)">
  <input type="number" id="a" /> + <input type="number" id="b" /> =
  <output name="res" for="a b"></output>
</form>
```

**Why it matters:** It semantically defines a "live" result, alerting assistive tech when the number changes.

### 🧱 `<wbr>`

**What it is:** A "Word Break Opportunity." It tells the browser "If you have to break this long string into two lines, do it here." (Perfect for long URLs or file paths).

### 📜 `<cite>` & `<q>`

**Now:**

```html
<p>As <cite>Steve Jobs</cite> said, <q>Stay hungry.</q></p>
```

**Why it matters:** `<cite>` handles the source, and `<q>` handles the inline quote (adding quotes automatically based on language).

---

## 🧭 The Bigger Picture

Just like the JavaScript evolution, HTML isn't just about "showing stuff on a screen." It’s about **meaning**.

When you use the right tag:

1. **Your SEO goes up** because Google knows exactly what your data is.
2. **Your A11y is "free"** because the browser handles the screen reader logic.
3. **Your JS bundle shrinks** because you don't need a library for a simple accordion.

Happy coding! 🙂
