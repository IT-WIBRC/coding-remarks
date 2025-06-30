# Monads: Handling Possibilities with Either and Maybe

Imagine you're building a complex machine. Every step in assembling it could either work perfectly (success\!) or something could go wrong (failure\!). If one tiny part breaks, you want to know immediately and stop the whole assembly line, rather than continuing to build something flawed.

In programming, especially with JavaScript and TypeScript, we constantly deal with things that can go right or wrong: fetching data from an API, parsing user input, performing calculations that might involve division by zero. Traditional `if/else` checks or `try/catch` blocks can become messy when chaining many of these "risky" operations.

This is where **Monads** come in. Don't let the fancy name scare you\! At their heart, Monads are just clever containers that help you manage computations, especially those that might involve "effects" like fetching data (which is asynchronous and can fail) or dealing with missing information. They give you a structured, functional way to handle these "what if it goes wrong?" moments.

We'll focus on two common and highly useful Monads: `Either` and `Maybe`.

---

## **Conceptual Monad Implementations (for understanding the examples)**

To make the examples clear without relying on external files, here are simplified TypeScript definitions for `IEither`, `AsyncEither`, and `IMaybe`. In a real project, these would typically be in a `utils/monads.ts` file or provided by a dedicated library.

```typescript
// --- Simplified IEither (Synchronous) Monad Definition ---
// This version works with synchronous values and functions.

interface IEither<L, R> {
  // Checks if it holds an error (Left)
  isLeft(): boolean;
  // Checks if it holds a success value (Right)
  isRight(): boolean;

  // Applies one of two synchronous functions based on whether it's Left or Right,
  // reducing the Either to a single, non-monadic result.
  fold<TResult>(onLeft: (value: L) => TResult, onRight: (value: R) => TResult): TResult;

  // Transforms the Right value synchronously. If Left, it just passes the Left along.
  map<TNewRight>(f: (value: R) => TNewRight): IEither<L, TNewRight>;

  // Chains an operation where the function `f` returns another *synchronous* Either.
  // If Left, it passes the Left along. Otherwise, it applies `f` and flattens the result.
  flatMap<TNewRight>(f: (value: R) => IEither<L, TNewRight>): IEither<L, TNewRight>;
}

class Left<L, R> implements IEither<L, R> {
  constructor(public readonly value: L) {} // Public for easy example access
  isLeft(): boolean {
    return true;
  }
  isRight(): boolean {
    return false;
  }
  fold<TResult>(onLeft: (value: L) => TResult, onRight: (value: R) => TResult): TResult {
    return onLeft(this.value);
  }
  map<TNewRight>(f: (value: R) => TNewRight): IEither<L, TNewRight> {
    return this as any;
  } // Type assertion for brevity
  flatMap<TNewRight>(f: (value: R) => IEither<L, TNewRight>): IEither<L, TNewRight> {
    return this as any;
  } // Type assertion for brevity
}

class Right<L, R> implements IEither<L, R> {
  constructor(public readonly value: R) {} // Public for easy example access
  isLeft(): boolean {
    return false;
  }
  isRight(): boolean {
    return true;
  }
  fold<TResult>(onLeft: (value: L) => TResult, onRight: (value: R) => TResult): TResult {
    return onRight(this.value);
  }
  map<TNewRight>(f: (value: R) => TNewRight): IEither<L, TNewRight> {
    return new Right(f(this.value));
  }
  flatMap<TNewRight>(f: (value: R) => IEither<L, TNewRight>): IEither<L, TNewRight> {
    return f(this.value);
  }
}

const Either = {
  left: <L, R>(value: L): IEither<L, R> => new Left(value),
  right: <L, R>(value: R): IEither<L, R> => new Right(value),
};

// --- Simplified AsyncEither (Asynchronous) Monad Definition ---
// This version wraps a Promise<IEither> and works with async functions.

class AsyncEither<L, R> {
  private constructor(public readonly promise: Promise<IEither<L, R>>) {}

  // Factory to start an AsyncEither chain from a Promise that resolves to an IEither
  public static fromPromise<L, R>(promise: Promise<IEither<L, R>>): AsyncEither<L, R> {
    return new AsyncEither(promise);
  }

  // Synchronous map for AsyncEither: applies `f` if the inner Either is Right.
  // The outer Promise is awaited, then the inner map is called.
  public map<TNewRight>(f: (value: R) => TNewRight): AsyncEither<L, TNewRight> {
    const newPromise = this.promise.then((either) => either.map(f));
    return new AsyncEither(newPromise);
  }

  // Asynchronous flatMap for AsyncEither: applies `f` if the inner Either is Right,
  // and `f` *must* return a Promise<IEither>. This Promise is then awaited and flattened.
  public flatMap<TNewRight>(
    f: (value: R) => Promise<IEither<L, TNewRight>>,
  ): AsyncEither<L, TNewRight> {
    const newPromise = this.promise.then(
      async (
        either, // Await the initial Promise<Either>
      ) =>
        either.isLeft()
          ? Promise.resolve(either as IEither<L, TNewRight>) // If Left, just resolve with the Left
          : f(
              either.fold(
                () => null as never,
                (val) => val,
              ),
            ), // If Right, apply f (which returns Promise<Either>)
    );
    // The .then(innerEither => innerEither) or similar flattening logic is implicitly handled
    // by the Promise chain itself, as 'f' already returns a Promise.
    return new AsyncEither(newPromise);
  }

  // Asynchronous fold for AsyncEither: waits for the inner Either, then folds it,
  // allowing you to handle the final result (success or error) asynchronously.
  public async fold<TResult>(
    onLeft: (value: L) => Promise<TResult> | TResult,
    onRight: (value: R) => Promise<TResult> | TResult,
  ): Promise<TResult> {
    const either = await this.promise; // Await to get the inner IEither
    return either.fold(onLeft, onRight); // Then fold the inner IEither
  }
}

const AsyncEitherFactory = {
  fromPromise: AsyncEither.fromPromise,
  // Helper to start with a known Left (e.g., immediate validation error)
  left: <L, R>(value: L): AsyncEither<L, R> =>
    new AsyncEither(Promise.resolve(Either.left<L, R>(value))),
  // Helper to start with a known Right (e.g., pre-existing valid data)
  right: <L, R>(value: R): AsyncEither<L, R> =>
    new AsyncEither(Promise.resolve(Either.right<L, R>(value))),
};

// --- Simplified IMaybe (Synchronous) Monad Definition ---
// This version works with synchronous values and functions.

interface IMaybe<T> {
  // Checks if it holds a value (Some)
  isSome(): boolean;
  // Checks if it holds no value (None)
  isNone(): boolean;

  // Applies one of two synchronous functions based on whether it's Some or None,
  // reducing the Maybe to a single, non-monadic result.
  fold<TResult>(onNone: () => TResult, onSome: (value: T) => TResult): TResult;

  // Transforms the Some value synchronously. If None, it just passes None along.
  map<TNew>(f: (value: T) => TNew): IMaybe<TNew>;

  // Chains an operation where the function `f` returns another *synchronous* Maybe.
  // If None, it passes None along. Otherwise, it applies `f` and flattens the result.
  flatMap<TNew>(f: (value: T) => IMaybe<TNew>): IMaybe<TNew>;
}

class Some<T> implements IMaybe<T> {
  constructor(public readonly value: T) {} // Public for easy example access
  isSome(): boolean {
    return true;
  }
  isNone(): boolean {
    return false;
  }
  fold<TResult>(onNone: () => TResult, onSome: (value: T) => TResult): TResult {
    return onSome(this.value);
  }
  map<TNew>(f: (value: T) => TNew): IMaybe<TNew> {
    return new Some(f(this.value));
  }
  flatMap<TNew>(f: (value: T) => IMaybe<TNew>): IMaybe<TNew> {
    return f(this.value);
  }
}

class None<T> implements IMaybe<T> {
  isSome(): boolean {
    return false;
  }
  isNone(): boolean {
    return true;
  }
  fold<TResult>(onNone: () => TResult, onSome: (value: T) => TResult): TResult {
    return onNone();
  }
  map<TNew>(f: (value: T) => TNew): IMaybe<TNew> {
    return this as any;
  }
  flatMap<TNew>(f: (value: T) => IMaybe<TNew>): IMaybe<TNew> {
    return this as any;
  }
}

const Maybe = {
  some: <T>(value: T): IMaybe<T> => new Some(value),
  none: <T>(): IMaybe<T> => new None(),
  // Helper to convert nullable JS values to Maybe
  fromNullable: <T>(value: T | null | undefined): IMaybe<T> =>
    value === null || typeof value === "undefined" ? Maybe.none<T>() : Maybe.some(value),
};
```

---

## 1\. Functional Programming Principles Encouraged by Monads

Monads are a cornerstone of functional programming (FP) and promote several key FP principles that lead to more maintainable and predictable code:

- **Immutability:**

  - **Principle:** Data, once created, cannot be changed. Any operation that seems to "modify" data actually returns a _new_ piece of data.
  - **Monadic Embodiment:** When you call methods like `map` or `flatMap` on a Monad instance (e.g., `eitherInstance.map(...)`), these methods **never modify the original `eitherInstance` itself.** Instead, they always return a **brand new Monad instance** with the transformed value (or the propagated effect). This ensures a predictable, non-mutating data flow.

- **Pure Functions (in context):**

  - **Principle:** A pure function always produces the same output for the same input and has no side effects (it doesn't change anything outside its scope).
  - **Monadic Embodiment:** The functions you pass to `map` (e.g., `rawData => JSON.parse(rawData)`) are ideally pure functions. The Monad provides a controlled environment where these pure transformations can be applied _only when the context allows_ (e.g., only if it's a `Right` or `Some` value). The Monad handles the "impure" aspect (like error propagation or optionality), allowing your core logic to remain pure.

- **Composition:**

  - **Principle:** Building complex operations by combining simpler, smaller, and well-defined functions.
  - **Monadic Embodiment:** This is one of the most powerful aspects. Monads provide standard interfaces (`map`, `flatMap`) for chaining operations that involve effects. If `operationA` produces a Monad, `operationB` can easily be applied to its result using `map` or `flatMap`, and the Monad ensures the correct flow (e.g., if `operationA` failed, `operationB` is skipped, and the failure propagates). This significantly reduces nested `if/else` statements.

- **Separation of Concerns:**

  - **Principle:** Dividing a computer program into distinct features that overlap in functionality as little as possible.
  - **Monadic Embodiment:** Monads allow you to separate the "pure computation" (what you want to do with a value) from the "handling of effects" (what happens if there's an error, or if the value is missing). Your core business logic can focus on transformations, while the Monad manages the complexities of context.

---

## 2\. The `Either` Monad: Managing Success or Failure in Synchronous Operations

The `Either` Monad is like a **"two-compartment box."** It can hold:

- A **`Left`** value: This is typically where you put an **error** message or an error object.
- A **`Right`** value: This is where you put your **successful** result or the data you want to carry forward.

The beauty is that an `Either` instance can _only ever be one of these two at a time_. TypeScript will ensure you acknowledge both possibilities.

**Why `Either` is awesome (for synchronous code):**

- **Explicit Error Handling:** You can't ignore errors\! Your types (`IEither<ErrorType, SuccessType>`) clearly show that an error is a possible outcome.
- **Functional Error Flow:** Errors don't "throw" and interrupt your program's flow. Instead, they become values that "flow" through your chain, skipping successful steps until you decide to handle them.
- **Clean Code:** Reduces nested `if/else` checks or `try/catch` blocks for sequential synchronous operations.

**Core `IEither` Operations (for deeper understanding):**

Your `IEither` implementation provides these methods:

- **`isLeft()` / `isRight()`:**

  - **Purpose:** These are simple detective methods, called **type guards**. They help TypeScript figure out which "side" of the `Either` container you're currently dealing with (`Left` or `Right`).
  - **How it works:** When you use `if (result.isLeft())`, TypeScript immediately understands that inside that `if` block, `result` _must_ be a `Left`. This means you can safely access its error value (`result.value`). If it's in the `else` block, TypeScript knows it _must_ be a `Right`, and you can access the success value (`result.value`).
  - **Example:**
    ```typescript
    // Imagine 'validationResult' is an IEither<string, number>
    if (validationResult.isLeft()) {
      console.error("Error message:", validationResult.value); // TypeScript knows .value is a string (L)
    } else {
      console.log("Success value:", validationResult.value); // TypeScript knows .value is a number (R)
    }
    ```

- **`map<U>(fn: (value: R) => U): IEither<L, U>`:**

  - **Purpose:** To transform the **successful value** inside the `Either` container _without changing its context_. Think of it like taking the good thing out of the `Right` box, changing it a bit, and putting the _new version_ back into a new `Right` box.
  - **Behavior:**
    - If the `Either` is `Right`, the function `fn` you provide is applied to its value (`R`), and the new result (`U`) is wrapped in a _new_ `Right` container.
    - If the `Either` is `Left`, the function `fn` is **never called**. The original `Left` container (with its error) is simply passed along unchanged.
  - **When to use:** Use `map` when the function `fn` is a **simple, synchronous transformation** that is **guaranteed to succeed** if it receives valid input. The function you pass to `map` should _not_ return another `Either` or `Promise`. It just returns a plain, transformed value.
  - **The Key Difference (Part 1):** The transformation method you pass to `map` is only for "simple transformations." It's expected to _always succeed_ if it receives an input (i.e., if the Monad is currently a `Right`). It just changes the value inside the successful box, but it cannot change the box into an "error" box itself.
  - **Example (Conceptual):**

    ```typescript
    // A synchronous function that simply doubles a number (won't fail if given a number)
    const double = (num: number): number => num * 2;

    const result1 = Either.right<string, number>(5).map(double);
    // result1 is IEither<string, number> and holds Right(10)

    const result2 = Either.left<string, number>("Invalid input").map(double);
    // result2 is IEither<string, number> and holds Left("Invalid input")
    // The 'double' function was never even called for result2.
    ```

- **`flatMap<U>(fn: (value: R) => IEither<L, U>): IEither<L, U>` (also known as `chain` or `bind`):**

  - **Purpose:** To chain operations where each step itself might **introduce a new success or failure context** (i.e., the function `fn` you provide returns another `Either`). This is crucial for "flattening" nested `Either`s.
  - **Behavior:**
    - If the `Either` is `Right`, the function `fn` is applied to its value (`R`). `fn` is _expected_ to return a _new_ `Either`. This new `Either` (whether `Left` or `Right`) then becomes the direct result of the `flatMap` operation. `flatMap` automatically "unwraps" `fn`'s `Either` and becomes that `Either`.
    - If the `Either` is `Left`, the function `fn` is **never called**. The original `Left` container is passed along unchanged.
  - **When to use:** Use `flatMap` when the function `fn` itself represents an operation that **might fail**, and therefore **returns another _synchronous_ `Either`**. (If `fn` returns a `Promise<Either>`, you'll need `AsyncEither.flatMap`, explained next\!). This is essential for building pipelines where each step has its own success/failure outcome.
  - **The Key Difference (Part 2):** The transformation method you pass to `flatMap` is designed to "succeed or fail." It's expected to return _another Monad_ (e.g., another `Either` instance). This allows you to build sequences where a failure at any point (`Left` result) will automatically bypass all subsequent successful steps (`Right` paths) and propagate the original error.
  - **Example (Conceptual):**

    ```typescript
    // A synchronous function that validates a user's age
    const validateAge = (age: number): IEither<string, number> => {
      if (age >= 18) return Either.right(age);
      return Either.left("Must be 18 or older to proceed.");
    };

    // A synchronous function that decides based on age
    const checkEligibility = (age: number): IEither<string, string> => {
      if (age > 65) return Either.left("Too old for this program.");
      return Either.right("Eligible for program.");
    };

    const eligibleResult = Either.right<string, number>(30) // Starts with a valid number
      .flatMap(validateAge) // Returns Right(30)
      .flatMap(checkEligibility); // Returns Right("Eligible for program.")
    // Result: Right("Eligible for program.")

    const tooYoungResult = Either.right<string, number>(16) // Starts with a number
      .flatMap(validateAge) // Returns Left("Must be 18 or older to proceed.")
      .flatMap(checkEligibility); // This flatMap is SKIPPED!
    // Result: Left("Must be 18 or older to proceed.")
    ```

- **`fold<U>(onLeft: (value: L) => U, onRight: (value: R) => U): U`:**

  - **Purpose:** To "extract" the value from the `Either` container by applying one of two provided functions, based on its state (`Left` or `Right`). This is typically the **last step** in a monadic chain, where you decide how to finally deal with the success or failure.
  - **Behavior:** If the `Either` is `Left`, the `onLeft` function is called with the error value (`L`). If the `Either` is `Right`, the `onRight` function is called with the success value (`R`). Both `onLeft` and `onRight` functions _must_ return the same type `U`.
  - **Advantage:** Forces you to explicitly handle both the success and failure paths, ensuring no case is missed. This is how you convert the `IEither` back into a concrete, non-Monadic value (or perform a side effect like updating state) based on its outcome.
  - **Why "fold" (and not "unwrap" or "unfold")?**
    - This term comes from the broader world of functional programming. In functional programming, `fold` (also called `reduce` or `aggregate`) refers to the idea of **taking a data structure and combining its elements to produce a single, summary value.**
    - For an `Either` Monad, the "data structure" has two possibilities: `Left` or `Right`. The `fold` method effectively **reduces these two possibilities down to a single outcome** by running _only one_ of the two functions you provide (one for `Left`, one for `Right`).
    - It helps you "get the value out" in a safe way, because you _must_ specify what to do in both the success and failure scenarios, thereby collapsing the `Either`'s dual nature into a single result.
    - **`unfold`**, on the other hand, is the exact opposite\! It takes a single "seed" value and **generates** a more complex structure (like building a list or a tree from a starting point). So, while `fold` helps you condense, `unfold` helps you expand.
  - **Example:**

    ```typescript
    // Function to display the final result message
    const getDisplayMessage = (eitherValue: IEither<string, string>): string => {
      return eitherValue.fold(
        // onLeft: what to do if it's an error
        (errorMessage: string) => `Operation Failed: ${errorMessage}`,
        // onRight: what to do if it's a success
        (successMessage: string) => `Operation Succeeded: ${successMessage}`,
      );
    };

    const successEither = Either.right<string, string>("User registration completed!");
    const errorEither = Either.left<string, string>("Email already taken.");

    console.log(getDisplayMessage(successEither)); // Output: "Operation Succeeded: User registration completed!"
    console.log(getDisplayMessage(errorEither)); // Output: "Operation Failed: Email already taken."
    ```

---

## 3\. The `AsyncEither` Monad: Managing Asynchronous Operations and Errors

Promises (`Promise<T>`) are the standard way to handle asynchronous operations in JavaScript. However, they only have two outcomes: resolve (success) or reject (error). They don't explicitly distinguish between a resolved Promise that contains meaningful data versus one that resolved with `null` or `undefined` (which might be a valid business outcome like "user not found," not a system error). They also don't standardize error shapes.

This is where **`AsyncEither`** comes in. It's a Monad designed specifically to work with `Promise<IEither<L, R>>`. It wraps a Promise that resolves to an `Either` (your explicit success/failure container), allowing you to chain `async` operations in a monadic style, maintaining explicit error handling throughout.

**Why `AsyncEither` is needed (and not just `IEither.flatMap`):**

The `IEither.flatMap` we just discussed works beautifully for synchronous operations where the function `fn` returns a plain `IEither`. But if `fn` itself is an `async` function (or returns a `Promise`) that also produces an `Either` (like fetching data from an API), a simple `IEither.flatMap` would lead to a nested Promise: `IEither<L, Promise<IEither<L, R>>>`. This is messy and defeats the purpose of flattening.

`AsyncEither` solves this by:

1.  Wrapping the `Promise<IEither<L, R>>` internally.
2.  Providing its own `map`, `flatMap`, and `fold` methods that correctly `await` the inner `Promise` and then apply the `Either`'s logic.

**Core `AsyncEither` Operations (for deeper understanding):**

Your `AsyncEither` implementation provides these methods:

- **`AsyncEither.fromPromise<L, R>(promise: Promise<IEither<L, R>>): AsyncEither<L, R>`:**

  - **Purpose:** This is your starting point. It takes a `Promise` that is expected to resolve to an `IEither` (e.g., the result of an API call that returns a standardized `Either`) and wraps it into an `AsyncEither` instance.
  - **How it works:** It creates the initial `AsyncEither` container that holds your `Promise<IEither>`.

- **`map<TNewRight>(f: (value: R) => TNewRight): AsyncEither<L, TNewRight>`:**

  - **Purpose:** To perform a **synchronous transformation** on the successful value (`R`) inside the `Either` that `AsyncEither` is wrapping.
  - **Behavior:** `AsyncEither.map` waits for its internal `Promise<IEither>` to resolve. If that `Either` is `Right`, it applies your function `f` to the value and wraps the new result in a `Right` within a new `Promise<IEither>`. If it's a `Left`, the `Left` is simply propagated.
  - **When to use:** Similar to `IEither.map`, for synchronous data re-shaping that won't fail.

- **`flatMap<TNewRight>(f: (value: R) => Promise<IEither<L, TNewRight>>): AsyncEither<L, TNewRight>`:**

  - **Purpose:** To chain **asynchronous operations** where the function `f` itself returns a `Promise<IEither>`. This is the core method for building long asynchronous chains with consistent error handling.
  - **Behavior:** `AsyncEither.flatMap` first waits for its own internal `Promise<IEither>` to resolve.
    - If the resolved `Either` is `Left`, the function `f` is **never called**, and the `Left` is immediately propagated to the end of the chain.
    - If the resolved `Either` is `Right`, the function `f` is called with the successful value (`R`). Crucially, `f` _must_ return a `Promise<IEither<L, TNewRight>>`. `AsyncEither.flatMap` then `await`s _this new Promise_ internally and "flattens" its result (the `IEither`) into the ongoing `AsyncEither` chain.
  - **When to use:** For any step in your asynchronous workflow that might involve an API call, another database lookup, or any operation that returns a `Promise` and could logically result in either success or a specific failure.

- **`fold<TResult>(onLeft: (value: L) => Promise<TResult> | TResult, onRight: (value: R) => Promise<TResult> | TResult): Promise<TResult>`:**

  - **Purpose:** To "exit" the `AsyncEither` monad at the very end of your chain. It waits for the entire asynchronous monadic computation to complete and then applies the appropriate handler (`onLeft` or `onRight`).
  - **Behavior:** It `await`s the `AsyncEither`'s internal `Promise<IEither>` to resolve. Once it has the final `IEither` (either `Left` or `Right`), it calls the corresponding `onLeft` or `onRight` function. These functions can also be `async` if needed. The final result is always a `Promise`.
  - **Advantage:** Provides a single, clear point to handle the ultimate success or failure of your entire complex asynchronous workflow.

---

## 4\. The `Maybe` Monad: Handling Optional Values

The `Maybe` Monad (often called `Optional` in other languages) is a simpler version of `Either`. It's like a **"single-compartment box that might be empty."**

- It can hold a `Just` value: Your actual data is definitely inside.
- It can hold a `Nothing`: Signifying the complete absence of a value (like `null` or `undefined`).

**Why `Maybe` is useful (especially for optional data):**

- **Clear Null/Undefined Handling:** It explicitly communicates that a value might or might not be present, which is more semantically meaningful than just `null`.
- **Prevents `null` Reference Errors:** You can apply operations to the value _only if it exists_, preventing common crashes from trying to access properties of `null`.
- **Cleaner Code:** Replaces verbose `if (value === null || value === undefined)` checks with more elegant monadic operations.

**Core `Maybe` Operations (for deeper understanding):**

Your `IMaybe` implementation provides these methods:

- **`isSome()` / `isNone()`:** Type guards to determine if a value is present (`Some`) or absent (`None`).

- **`fromNullable<T>(value: T | null | undefined): IMaybe<T>`:** A crucial factory method. It converts a standard nullable JavaScript value into a `Maybe` Monad. If `value` is `null` or `undefined`, it returns `Maybe.none()`; otherwise, it returns `Maybe.some(value)`.

- **`map<U>(fn: (value: T) => U): IMaybe<U>`:**

  - **Purpose:** To transform the value inside the `Maybe` container _if it exists_.
  - **Behavior:**
    - If the `Maybe` is `Some`, `fn` is applied to its value, and the new result is wrapped in a _new_ `Some` container.
    - If the `Maybe` is `None`, `fn` is **never called**. The `None` container is simply passed along.
  - **Example (Conceptual):**

    ```typescript
    const userSettingsString = '{"theme":"dark"}'; // Imagine this comes from local storage
    const userSettings = Maybe.fromNullable(userSettingsString).map(JSON.parse); // Parses string to object only if string exists

    const theme = userSettings.map((settings) => settings.theme); // Gets theme only if settings object exists
    // theme will be Maybe.some("dark")

    const nonExistentSettings = Maybe.fromNullable(null) // Nothing here
      .map(JSON.parse)
      .map((settings) => settings.theme);
    // nonExistentSettings will be Maybe.none()
    ```

- **`flatMap<U>(fn: (value: T) => IMaybe<U>): IMaybe<U>`:**

  - **Purpose:** To chain operations where each step itself might **result in the absence of a value** (i.e., `fn` returns another `Maybe`). This "flattens" nested `Maybe`s.

  - **Behavior:**

    - If the `Maybe` is `Some`, `fn` is applied to its value. `fn` is _expected_ to return a _new_ `Maybe`. This new `Maybe` becomes the result.
    - If the `Maybe` is `None`, `fn` is **never called**. The original `None` container is passed along.

  - **Advantage:** Allows you to sequence operations where intermediate steps might become empty, short-circuiting the chain.

  - **Example (Conceptual):**

    ```typescript
    // Function that might return a user object from cache or nothing
    const lookupUserInCache = (id: string): IMaybe<{ id: string; name: string }> => {
      if (id === "cachedUser") return Maybe.some({ id: "cachedUser", name: "John" });
      return Maybe.none(); // User not found in cache
    };
    // Function that takes a user and might return their active session ID or nothing
    const getActiveSessionId = (user: { id: string }): IMaybe<string> => {
      if (user.id === "cachedUser") return Maybe.some("session123");
      return Maybe.none(); // No active session
    };

    const sessionId = lookupUserInCache("cachedUser") // IMaybe.some(User)
      .flatMap((user) => getActiveSessionId(user)); // IMaybe.some("session123")

    const noSessionId = lookupUserInCache("otherUser") // IMaybe.none()
      .flatMap((user) => getActiveSessionId(user)); // flatMap skipped, result is IMaybe.none()
    ```

- **`fold<U>(onNone: () => U, onSome: (value: T) => U): U`:**

  - **Purpose:** To "extract" the value from the `Maybe` container by applying one of two functions, based on its state (`Some` or `None`). This is typically the **last step** in a `Maybe` chain.
  - **Behavior:** If `Maybe` is `None`, the `onNone` function (which takes no arguments) is called. If `Maybe` is `Some`, the `onSome` function (which receives the value `T`) is called. Both functions must return the same type `U`.
  - **Advantage:** Forces you to explicitly handle both the "value present" and "no value" paths, ensuring no case is missed.

---

## 5\. Building Monadic Pipelines: Chaining Synchronous and Asynchronous Operations

This is where the power of `Either` and `AsyncEither` truly shines together, leveraging functional programming principles for a robust data processing pipeline.

Let's imagine a scenario where we want to:

1.  **Validate a user's raw input synchronously** (can fail: returns `Either`).
2.  If valid, **fetch detailed user data from an API** (asynchronous, can fail or return no data: `Promise<Either>`).
3.  If data is fetched, **try to parse a specific JSON string field** (synchronous, can fail if malformed: returns `Either`).
4.  If successfully parsed, **extract an optional `theme` preference** (synchronous, can be missing: `Maybe`).
5.  Finally, **present the overall result** or an error message.

This pipeline combines synchronous steps, asynchronous steps (Promises), and operations that might explicitly produce errors or nulls, all managed using Monads.

```typescript
// --- Simplified API Service Mocks (Returning Promises of raw data or null) ---
// In a real app, these would be your actual fetch/axios calls to a backend.
type RawUserData = { id: string; name: string; detailsJson: string | null };

const mockApiService = {
  fetchRawUserData: async (userId: string): Promise<RawUserData | null> => {
    console.log(`[API Mock] Fetching raw user data for: ${userId}`);
    return new Promise((resolve) =>
      setTimeout(() => {
        if (userId === "valid_alice") {
          resolve({
            id: "valid_alice",
            name: "Alice",
            detailsJson: '{"theme":"dark","lastLogin":"2023-10-26"}',
          });
        } else if (userId === "valid_bob_malformed") {
          resolve({ id: "valid_bob_malformed", name: "Bob", detailsJson: '{"theme:"light"}' }); // Malformed JSON
        } else if (userId === "valid_charlie_no_details") {
          resolve({ id: "valid_charlie_no_details", name: "Charlie", detailsJson: null }); // Valid user, but no specific details string
        } else {
          resolve(null); // User not found
        }
      }, 300),
    );
  },
};

// --- Monadic Pipeline Components ---

// Synchronous Step: Validate input (returns IEither<error, value>)
const validateInput = (input: string): IEither<string, string> => {
  console.log(`[Pipeline Step] Validating input: "${input}"`);
  if (input && input.length > 5 && input.startsWith("valid_")) {
    return Either.right(input);
  }
  return Either.left("Input is invalid. Must be > 5 chars and start with 'valid_'.");
};

// Asynchronous Step: Fetch data from API (returns Promise<IEither<error, value>>)
// This function handles both API rejections and the API returning null data.
const getUserDataFromApi = async (userId: string): Promise<IEither<string, RawUserData>> => {
  try {
    const rawData = await mockApiService.fetchRawUserData(userId); // Await the API call
    if (rawData === null) {
      return Either.left(`User with ID '${userId}' not found in API.`);
    }
    return Either.right(rawData);
  } catch (e: any) {
    // Catch API call rejections (e.g., network error, server error)
    return Either.left(`API error fetching user data: ${e.message}`);
  }
};

// Synchronous Step: Parse JSON field (returns IEither<error, value>)
const parseUserDetails = (
  data: RawUserData,
): IEither<string, { theme?: string; lastLogin?: string }> => {
  console.log(`[Pipeline Step] Attempting to parse user details JSON.`);
  try {
    if (data.detailsJson === null) {
      return Either.left("No details string available for parsing.");
    }
    // Attempt to parse the JSON. JSON.parse can throw an error if the string is malformed.
    const parsed = JSON.parse(data.detailsJson);
    return Either.right(parsed);
  } catch (e: any) {
    return Either.left(`Malformed JSON details: ${e.message}`);
  }
};

// Main Function orchestrating the pipeline
// This function returns a Promise<string> as its final non-Monadic result
async function processUserWorkflow(rawUserInput: string): Promise<string> {
  console.log(`\n--- Starting Workflow for: "${rawUserInput}" ---`);

  // Step 1: Start the AsyncEither chain.
  // We first perform a synchronous validation, then wrap its Either result in a Promise.
  // AsyncEitherFactory.fromPromise then takes this Promise<Either> to start the chain.
  const finalAsyncResult = await AsyncEitherFactory.fromPromise(
    Promise.resolve(validateInput(rawUserInput)), // Promise.resolve wraps the synchronous Either
  )
    // Step 2: FlatMap to an asynchronous operation (API call)
    .flatMap(async (validInput: string) => {
      // Inside this async callback, we explicitly await the Promise<IEither>
      // returned by getUserDataFromApi.
      const userDataEither = await getUserDataFromApi(validInput);
      console.log(
        `[Pipeline Step] User data fetch result: ${userDataEither.isRight() ? "Success" : "Failure"}`,
      );
      // Since this callback is 'async', returning 'userDataEither' (which is IEither)
      // implicitly wraps it in 'Promise.resolve(userDataEither)', which matches what flatMap expects.
      return userDataEither;
    })
    // Step 3: FlatMap to a synchronous operation that returns an Either (JSON parsing)
    .flatMap((rawUserData: RawUserData) => {
      // This flatMap receives RawUserData (from a Right from the API call).
      // It calls a synchronous function that returns an IEither (for parsing).
      console.log(`[Pipeline Step] Data fetched, parsing details.`);
      return parseUserDetails(rawUserData);
    })
    // Step 4: FlatMap to extract an optional value using Maybe, then convert back to Either
    .flatMap((parsedDetails: { theme?: string; lastLogin?: string }) => {
      // This flatMap receives the parsed details object (from a Right from parsing).
      // We extract the 'theme' which is optional, so we use Maybe.
      console.log(`[Pipeline Step] Extracting optional theme preference.`);

      const maybeTheme = Maybe.fromNullable(parsedDetails.theme);

      // Convert the Maybe to an Either for consistent chaining, handling 'None' as a specific message.
      // This part always returns an Either (no Promise), which flatMap then handles.
      return maybeTheme.fold(
        // If theme is None
        () =>
          Either.right<string, { userStatus: string; userTheme: string }>({
            userStatus: "Processed (No Theme Found)",
            userTheme: "default",
          }),
        // If theme is Some
        (theme: string) =>
          Either.right<string, { userStatus: string; userTheme: string }>({
            userStatus: "Processed (Theme Found)",
            userTheme: theme,
          }),
      );
    });
  // Notice how the chain just keeps flowing without extra try/catch or if/else blocks for errors!

  // Final step: Use AsyncEither.fold to get the non-Monadic result from the AsyncEither Monad.
  // This 'fold' is applied to the result of the entire asynchronous chain.
  const finalOutcome = await finalAsyncResult.fold(
    // onLeft: Handles any error (string) that propagated through the entire chain
    (errorMessage: string) => `Workflow failed: ${errorMessage}`,
    // onRight: Handles the final successful data
    (data: { userStatus: string; userTheme: string }) =>
      `Workflow succeeded! Status: ${data.userStatus}, Theme: ${data.userTheme}`,
  );

  console.log(finalOutcome);
  return finalOutcome;
}

// --- Run the workflow for different scenarios ---
(async () => {
  await processUserWorkflow("valid_alice"); // Full success: Input -> API -> Parse -> Theme
  await processUserWorkflow("invalid_input"); // Fails validation: (Step 1)
  await processUserWorkflow("valid_noSuchUser"); // Validation success, API fetch fails (user not found): (Step 2)
  await processUserWorkflow("valid_bob_malformed"); // API fetch success, JSON parsing fails: (Step 3)
  await processUserWorkflow("valid_charlie_no_details"); // API fetch success, but no details string for parsing: (Step 3)
})();
```

---

## 6\. Choosing Your Tool: `AsyncEither` vs. RxJS (and When to Use `Either` Alone)

You've now seen how `Either` handles synchronous operations and how `AsyncEither` manages asynchronous chains. But how do you decide which pattern is right for your project? And when might RxJS be a better fit?

### When to use `Either` (Synchronous Error Handling)

- **For Purely Synchronous Operations:** If you have functions that immediately return a value but might fail (e.g., data validation, synchronous parsing, complex calculations that could throw specific business errors).
- **Compile-Time Guarantees:** You want TypeScript to force you to handle success and failure branches for every call.
- **Simplicity is Key:** For straightforward error handling without asynchronous or stream-like complexities.

### When to use `AsyncEither` (Asynchronous Error Handling & Chaining)

- **Sequential Asynchronous Operations:** When you have a chain of `Promise`-based API calls or other async tasks where one step _depends_ on the successful outcome of the previous step.
- **Explicit Error Propagation:** You want errors from any point in the async chain to propagate cleanly to the end, skipping subsequent operations, and be handled in a single `fold` statement.
- **"Railway-Oriented Programming":** This pattern helps ensure your data stays on the "happy path" (`Right`) or gets shunted onto an "error track" (`Left`) very early and consistently.
- **Avoiding `try/catch` nests:** It reduces the need for multiple `try/catch` blocks in deeply nested `async/await` sequences, making the code flow linearly.

### When to consider RxJS (Reactive Programming)

- **Complex Asynchronous Streams:** When your data flows are not just sequential `Promise` chains but involve:
  - **Multiple independent concurrent operations** that need to be combined (`forkJoin`, `zip`).
  - **User interactions/events** (e.g., autocomplete search with debouncing, button clicks, drag-and-drop).
  - **Real-time data** (WebSockets, server-sent events).
  - **Retrying failed operations** with specific delays (`retry`, `retryWhen`).
  - **Throttling/debouncing** events.
  - **Race conditions** (`switchMap`, `mergeMap`).
- **Long-Lived Operations:** For ongoing data streams that might emit multiple values over time.
- **Unified Async Model:** If you want a single, consistent way to handle _all_ forms of asynchronicity in your application.
- **Large-Scale Applications:** RxJS is a powerful, opinionated library often adopted in large codebases (e.g., Angular projects often use it heavily) where its benefits in managing complexity outweigh its initial learning curve.

### Making Your Choice:

- **Start Simple:** For many applications, well-structured `async/await` with `try/catch` is perfectly adequate.
- **Embrace Monads if:** You hit a wall with nested `if/else` or `try/catch` in _sequential_ operations, desire stronger compile-time guarantees for error/optionality handling, and appreciate the functional programming paradigm. `Either` (for sync) and `AsyncEither` (for async) offer a robust step up without the full conceptual leap to reactive streams.
- **Consider RxJS if:** Your application's asynchronous needs clearly extend beyond sequential chaining into complex event handling, real-time data, or intricate concurrency management. It's a significant investment in a new paradigm, but it offers unparalleled power for stream-based logic.

Ultimately, the "best" choice is the one that fits your project's complexity, team's expertise, and future maintenance needs. Both Monads and RxJS are excellent tools that aim to bring clarity and control to the chaotic world of asynchronous programming.
