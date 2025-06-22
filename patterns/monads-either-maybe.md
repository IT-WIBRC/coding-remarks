# Architectural Pattern: Monads (Either and Maybe) for Robust Data Flow

In functional programming, Monads are patterns that allow us to structure computations involving sequential operations where each step might introduce an "effect." An "effect" could be:

- **Failure/Error:** An operation might not complete successfully.
- **Absence of a Value:** An operation might succeed but yield no result.
- **Asynchronicity:** An operation might take time to produce a result (like a `Promise`).

Monads are essentially **design patterns for "containers" or "wrappers"** that encapsulate a value along with some context (like the possibility of an error, or the possibility of being empty). They provide specific methods (`map`, `flatMap`/`chain`, `fold`) that let us work with the values _inside_ these containers without having to constantly "unwrap" and check for the context manually at each step. This leads to more expressive, safer, and less error-prone code.

---

## 1. Functional Programming Principles Encouraged by Monads

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

## 2. The `Either` Monad: Managing Success or Failure

The `Either` Monad is a powerful tool for representing operations that can have one of two distinct outcomes: a **successful value** or a **failure (an error)**. It forces you to explicitly deal with both possibilities at the type level.

- **`Right<R>`:** Represents the **successful** path. If an operation succeeds, its result is wrapped in a `Right` container. `R` stands for the type of the **Right** (success) value.
- **`Left<L>`:** Represents the **failure** path. If an operation fails, the error or failure reason is wrapped in a `Left` container. `L` stands for the type of the **Left** (error) value.

**Why it's useful (especially for API calls):**

- **Explicit Error Handling:** The type signature `IEither<L, R>` immediately tells any consumer that this operation might fail, and that the failure will be of type `L`, while success will be of type `R`. This moves error handling from implicit runtime checks to explicit compile-time guarantees.
- **Centralized Error Mapping:** Your `wrapServiceCall` (as discussed in [API Service Layer Design](./api-service-layer-design.md)) uses `Either`. It takes messy, diverse backend errors (Supabase `AuthError`, `PostgrestError`, network issues) and _transforms_ them into a single, clean `ResponseOnError` object that your frontend understands. This translation happens only once inside the `wrapServiceCall`, and all downstream code simply receives an `Either.left(standardizedError)`.
- **Type Safety:** You cannot accidentally treat a potential error as a success, and TypeScript will guide you to handle both `Left` and `Right` cases.

**Core `IEither` Operations (for deeper understanding):**

Your `IEither` implementation (from `~/api/utils/monads.ts`) provides these methods:

- **`isLeft()` / `isRight()`:** These are type guards that allow TypeScript to narrow the type within conditional blocks.

  ```typescript
  if (result.isLeft()) {
    // TypeScript knows 'result' is Left<L, R> here, so you can access result.value (the error)
  } else {
    // TypeScript knows 'result' is Right<L, R> here, so you can access result.value (the success data)
  }
  ```

- **`map<U>(fn: (value: R) => U): IEither<L, U>`:**

  - **Purpose:** To transform the **successful value** inside the `Either` container _without changing its context_.
  - **Behavior:**
    - If the `Either` is `Right`, `fn` is applied to its value, and the new result is wrapped in a _new_ `Right` container.
    - If the `Either` is `Left`, `fn` is **never called**. The original `Left` container (with its error) is simply passed along unchanged.
  - **Advantage:** You can chain multiple transformations on the successful path, knowing that if an error occurred earlier, no transformations will execute. This avoids `if (success) { transform() }` at every step.
  - **Example (Conceptual):**
    ```typescript
    const parsedResult = apiCall().map((rawData) => JSON.parse(rawData)); // Parses only if successful
    const formattedResult = parsedResult.map((data) => ({ ...data, formatted: true })); // Formats only if parsed
    ```

- **`flatMap<U>(fn: (value: R) => IEither<L, U>): IEither<L, U>` (also known as `chain` or `bind`):**

  - **Purpose:** To chain operations where each step itself might **introduce a new success or failure context** (i.e., `fn` returns another `Either`). This is crucial for "flattening" nested `Either`s.
  - **Behavior:**
    - If the `Either` is `Right`, `fn` is applied to its value. `fn` is _expected_ to return a _new_ `Either`. This new `Either` becomes the result of the `flatMap` operation.
    - If the `Either` is `Left`, `fn` is **never called**. The original `Left` container is passed along.
  - **Advantage:** Prevents "nested Monads" (e.g., `Either<Error, Either<Error, Data>>`). It allows you to sequence operations that can fail independently, and the first failure will short-circuit the entire chain.
  - **Example (Conceptual):**

    ```typescript
    // Function that might return a user or an error
    const getUser = (id: string): IEither<Error, User> => {
      /* ... */
    };
    // Function that takes a user and might return their preferences or an error
    const getPreferences = (user: User): IEither<Error, Preferences> => {
      /* ... */
    };

    const userAndPrefs = getUser("some-id") // IEither<Error, User>
      .flatMap((user) => getPreferences(user)); // IEither<Error, Preferences> (flattens the result)

    // If getUser returns Left, getPreferences is never called, and userAndPrefs will be Left.
    // If getUser returns Right and getPreferences returns Left, userAndPrefs will be Left.
    // Only if both return Right will userAndPrefs be Right.
    ```

- **`fold<U>(onLeft: (value: L) => U, onRight: (value: R) => U): U`:**
  - **Purpose:** To "extract" the value from the `Either` container by applying one of two provided functions, based on its state (`Left` or `Right`). This is typically the **last step** in a monadic chain.
  - **Behavior:** If `Either` is `Left`, `onLeft` is called. If `Either` is `Right`, `onRight` is called. Both functions must return the same type `U`.
  - **Advantage:** Forces you to explicitly handle both the success and failure paths, ensuring no case is missed. This is how you convert the `IEither` back into a concrete value (or perform a side effect like updating state) based on its outcome.

---

## 3. The `Maybe` Monad: Handling Optional Values

The `Maybe` Monad (often called `Optional` in other languages) is used when an operation might succeed, but the result could legitimately be **a value or nothing at all** (`null` or `undefined`).

- **`Some<T>`:** Represents the **presence** of a value. If a value exists, it's wrapped in a `Some` container. `T` is the type of the value.
- **`None`:** Represents the **absence** of a value. If there's no value (equivalent to `null` or `undefined`), it's a `None` container.

**Why it's useful (especially for optional data):**

- **Clear Null/Undefined Handling:** It distinguishes between an actual value being present and a deliberate "nothing" state, which is more semantically meaningful than just `null`.
- **Prevents `null` Reference Errors:** You can apply operations to the value _only if it exists_, preventing common crashes from trying to access properties of `null`.
- **Cleaner Code:** Replaces `if (value !== null && value !== undefined)` checks with more elegant monadic operations.

**Core `Maybe` Operations (for deeper understanding):**

Your `Maybe` implementation (from `~/api/utils/monads.ts`) provides these methods:

- **`isSome()` / `isNone()`:** Type guards to determine the state.
- **`fromNullable<T>(value: T | null | undefined): Maybe<T>`:** A crucial factory method. It converts a standard nullable JavaScript value into a `Maybe` Monad. If `value` is `null` or `undefined`, it returns `Maybe.none()`; otherwise, it returns `Maybe.some(value)`.
- **`map<U>(fn: (value: T) => U): Maybe<U>`:**

  - **Purpose:** To transform the value inside the `Maybe` container _if it exists_.
  - **Behavior:**
    - If the `Maybe` is `Some`, `fn` is applied to its value, and the new result is wrapped in a _new_ `Some` container.
    - If the `Maybe` is `None`, `fn` is **never called**. The `None` container is simply passed along.
  - **Example (Conceptual):**
    ```typescript
    const user = getUserFromCache().map((u) => u.name); // Gets name only if user exists
    const capitalizedName = user.map((name) => name.toUpperCase()); // Capitalizes only if name exists
    ```

- **`flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U>`:**

  - **Purpose:** To chain operations where each step itself might **result in the absence of a value** (i.e., `fn` returns another `Maybe`). This "flattens" nested `Maybe`s.
  - **Behavior:**
    - If the `Maybe` is `Some`, `fn` is applied to its value. `fn` is _expected_ to return a _new_ `Maybe`. This new `Maybe` becomes the result.
    - If the `Maybe` is `None`, `fn` is **never called**. The original `None` container is passed along.
  - **Advantage:** Allows you to sequence operations where intermediate steps might become empty, short-circuiting the chain.
  - **Example (Conceptual):**

    ```typescript
    // Function that might return a user or nothing
    const findUser = (id: string): Maybe<User> => {
      /* ... */
    };
    // Function that takes a user and might return their profile picture URL or nothing
    const getProfilePicture = (user: User): Maybe<string> => {
      /* ... */
    };

    const userPicUrl = findUser("user-123") // Maybe<User>
      .flatMap((user) => getProfilePicture(user)); // Maybe<string> (flattens)

    // If findUser returns None, getProfilePicture is never called, and userPicUrl will be None.
    // If findUser returns Some and getProfilePicture returns None, userPicUrl will be None.
    // Only if both return Some will userPicUrl be Some.
    ```

- **`fold<U>(onNone: () => U, onSome: (value: T) => U): U`:**
  - **Purpose:** To "extract" the value from the `Maybe` container by applying one of two functions, based on its state (`Some` or `None`). This is typically the **last step** in a `Maybe` chain.
  - **Behavior:** If `Maybe` is `None`, `onNone` is called. If `Maybe` is `Some`, `onSome` is called. Both functions must return the same type `U`.
  - **Advantage:** Forces you to explicitly handle both the "value present" and "no value" paths, ensuring no case is missed.

---

## 4. The Monadic Pipeline: `wrapServiceCall` and Utilities (Deep Dive)

This is where the power of `Either` and `Maybe` truly shines together in your application's architecture, leveraging functional programming principles for a robust API response pipeline.

**The Role of `Promise` (A Monad for Asynchronicity):**

- Before we even get to `Either`, your raw API calls return `Promise`s. A `Promise` itself is a monad. Its "effect" is asynchronicity, and its `then()` method acts like `flatMap` (it applies a function to the resolved value and "flattens" nested promises, or propagates rejections).
- However, `Promise` only has two states for its _result_: "resolved with a value" or "rejected with an error." It doesn't explicitly distinguish between "resolved with actual data" vs. "resolved with null/no data" for business logic, and it doesn't standardize error shapes.

**Your Monadic Pipeline in Action:**

1.  **Raw API Call (Returns `Promise`):**

    ```typescript
    // Inside badgeService.getById(id):
    supabase.from("badges").select("*").eq("id", id).single(); // Returns Promise<PostgrestSingleResponse<IBadgeData | null>>
    ```

    This `Promise` can either resolve with a `data` object (which might be `null`) or reject with a `PostgrestError`.

2.  **`wrapServiceCall` (Transforms `Promise`'s Effect into `Either`'s Effect):**

    ```typescript
    // Inside your store, when calling the service:
    const eitherResultPromise = wrapServiceCall(badgeService.getById(id));
    // type of eitherResultPromise is Promise<IEither<ResponseOnError, ServiceWrapperSuccess<IBadgeData>>>
    ```

    - `wrapServiceCall` `await`s the raw `Promise`.
    - If the `Promise` **rejects**, `wrapServiceCall` catches the error and _returns_ `Either.left(standardizedError)`. This is a crucial transformation: the `Promise`'s "rejection" effect is converted into `Either`'s "Left" effect. The `Promise` itself still _resolves_, but its resolved value is an `Either.left`.
    - If the `Promise` **resolves**, `wrapServiceCall` takes the `PostgrestResponse` and returns `Either.right({ data: extractedData, count: extractedCount })`.
    - **Result:** You now have a `Promise` that _always resolves_, and its resolved value is always an `IEither` container, which explicitly signals success or a standardized error. This makes the next step predictable.

3.  **`handleSingleItemResponse` / `handleListResponse` (Safely Unwrapping `Either` then `Maybe`):**

    ```typescript
    // In your store, after awaiting the promise:
    const eitherResult = await eitherResultPromise;
    // type of eitherResult is IEither<ResponseOnError, ServiceWrapperSuccess<IBadgeData>>

    return handleSingleItemResponse<BadgeDomain, ApiResponseResult<BadgeDomain>>(eitherResult, {
      onFound: (data, count) => {
        /* ... */
      },
      onNotFound: (count) => {
        /* ... */
      },
      onError: (errorMessage) => {
        /* ... */
      },
    });
    ```

    - `handleSingleItemResponse` (or `handleListResponse`) takes the `eitherResult` (which is an `IEither`).
    - It immediately calls `eitherResult.fold()`:
      - **If `eitherResult` is `Left`:** The `onError` handler is invoked directly, providing the standardized error message. The rest of the success logic is skipped.
      - **If `eitherResult` is `Right`:** It proceeds to the `onRight` branch, which receives the `ServiceWrapperSuccess` object (containing `data` and `count`).
    - Inside the `onRight` branch, it then uses `Maybe.fromNullable(successResponse.data)`:
      - This creates a `Maybe.some(data)` if `data` is present, or `Maybe.none()` if `data` was `null` or `undefined` (which happens for "not found" scenarios in Supabase or `returning: 'minimal'` queries).
    - Finally, it calls `Maybe.fold()` on this `Maybe` instance:
      - **If `Maybe.some(data)`:** The `onFound` (or `onFoundList`) handler is called with the actual data.
      - **If `Maybe.none()`:** The `onNotFound` (or `onEmptyList`) handler is called, signifying no data.

---

## 5. The Synergistic Power: Monads + Domain Abstraction for Separated and Agnostic Code

The true power of this architectural approach becomes evident when you combine the **Monadic Pipeline** with the **Domain Management using Abstraction** pattern. This creates a highly decoupled, robust, and maintainable application.

### A. Two Layers of Decoupling (Agnosticism)

1.  **API Agnosticism (Handled by Monadic Pipeline via `wrapServiceCall`):**

    - **Problem Solved:** Raw, inconsistent API responses (varying error formats, different data structures for success/failure).
    - **Solution:** `wrapServiceCall` acts as the first line of defense. It takes any raw API promise (from Supabase or other services) and **always** transforms its outcome into a standardized `IEither<ResponseOnError, ServiceWrapperSuccess<TData>>` format.
    - **Benefit:** Your application's services, stores, and components downstream **never need to know** the specifics of Supabase's `PostgrestError`, `AuthError`, or whether a raw success response has `data` or `count` fields in a particular way. They only interact with the `IEither` interface.

2.  **Domain Agnosticism (Handled by Domain Objects):**
    - **Problem Solved:** API response fields (`uuid`, `first_name`, `status_code`) often don't match your application's internal business terminology (`id`, `firstName`, `isActive`).
    - **Solution:** Your Domain Objects (e.g., `BadgeDomain`, `UserProfileDomain`) act as the second layer of translation. They consume the _standardized_ `ServiceWrapperSuccess` data from the monadic pipeline and map it to your clean, business-centric model. For example, `UserProfileDomain.create(apiData)` converts `apiData.uuid` to `user.id` and `apiData.status_code` to `user.isActive`.
    - **Benefit:** Your stores, getters, and UI components operate purely on these consistent, normalized Domain Objects (`user.fullName`, `user.isEmpty`). They are completely **agnostic to the specific API field names or data types**.

### B. Combined Benefits: More Robust and Less Error-Prone Code

- **Exceptional Decoupling:** Changes to the backend API's raw response structure are isolated to `wrapServiceCall` and the `Domain.create()` methods. The vast majority of your application's logic, state, and UI remains untouched, significantly reducing "ripple effect" bugs.
- **End-to-End Type Safety:** TypeScript is leveraged at every layer:
  - `wrapServiceCall` uses `IEither` for explicit error/success states.
  - `handleSingleItemResponse`/`handleListResponse` use `IEither.fold()` and `Maybe.fold()` to ensure all outcomes are handled.
  - Domain objects use `IDomain` and `isEmpty` for guaranteed object presence (no `null`) and clear data status. This prevents dreaded `TypeError: Cannot read properties of undefined (reading 'xyz')`.
- **Predictable State:** Your stores will always contain valid Domain Object instances (either filled with data or an `empty()` placeholder), leading to more consistent and predictable application state.
- **Cleaner Business Logic and UI:** Your core application logic and UI components can focus on _what_ to do with the data, rather than _how_ to get it, _how_ to parse it, or _if_ it even exists. They simply interact with the well-defined and reliable methods and properties of your Domain Objects.
- **Improved Testability:** Each layer (service, wrapper, domain, store, component) can be tested more easily in isolation, as their inputs and outputs are clearly defined and consistent.

This powerful combination elevates your application's architecture, making it highly adaptable to change, significantly more robust against errors, and much easier for developers to understand and maintain.
