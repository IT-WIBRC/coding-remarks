# Securing API Keys with Serverless Proxies

## 🛑 The Problem: The "Tutorial Trap"

Most React tutorials instruct developers to store API keys in an `.env` file. While this prevents keys from being committed to GitHub, it is important to understand that **environment variables prefixed with `VITE_` or `REACT_APP_` are embedded into the client-side bundle.**

Any key used in a client-side `fetch()` or `axios` call is still visible to anyone who opens the browser's "Network" tab. For a public API like **TMDB**, this exposes your quota and potentially your account to malicious actors.

---

## 💡 The Solution: Netlify Functions as a Proxy

Instead of calling the TMDB API directly from the React components, I architected a **Backend Proxy** using **Netlify Functions**. This ensures the API key never leaves the server environment.

### 1. The Architecture

- **Frontend:** Sends a request to a local endpoint: `/.netlify/functions/get-movies?query=...`
- **Serverless Function:** Resides on the server, retrieves the `TMDB_API_KEY` from the secure environment variables, and makes the actual request to TMDB.
- **Frontend:** Receives the clean JSON data without ever seeing the secret key.

### 2. Implementation Comparison

#### ❌ The Vulnerable Way (Client-Side)

```javascript
// DON'T DO THIS: The key is leaked to the browser's Network tab!
const API_KEY = import.meta.env.VITE_TMDB_KEY;
const response = await fetch(
  `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`,
);
```

#### ✅ The Secure Way (Netlify Function)

Create a file at `netlify/functions/get-movies.js`:

```javascript
exports.handler = async (event) => {
  const API_KEY = process.env.TMDB_API_KEY; // Safely accessed on the server
  const { query } = event.queryStringParameters;

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`,
    );
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
```

---

## ⚡ Enhancing UX with React 19 Hooks

To make the search experience seamless while the proxy is fetching data, I implemented:

- **`useTransition`**: Manages the UI state during the "search" transition, ensuring the input remains responsive even during network latency.
- **`useActionState`**: Handles the search form submission and state management natively, reducing boilerplate.
- **Skeleton Screens**: Improved perceived performance by replacing traditional loading spinners with layout placeholders that mimic the content structure.

---

## 🛡️ Security Checklist

As a trainer, I emphasize these three pillars for production-grade frontend engineering:

1. **Never trust the client-side**: Sensitive logic and secrets must stay on the server.
2. **Proxy third-party APIs**: Always use serverless functions or a backend to protect your quotas and keys.
3. **Manage Network Resources**: Use `AbortController` to cancel pending requests when a user navigates away or types a new query rapidly. This prevents race conditions and saves bandwidth.
