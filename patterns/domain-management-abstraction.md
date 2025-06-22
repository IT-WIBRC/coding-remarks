# Architectural Pattern: Domain Management using Abstraction

This pattern helps you manage the data (your "domain objects") in your application more cleanly. It makes your app's display and internal logic more robust and less dependent on how data comes from your API.

---

## 1. The `IDomain` Interface: A Common Blueprint

**Purpose:** `IDomain` acts as a basic blueprint for all your important data objects (like a User, a Product, or a Badge). It sets common rules for all of them.

**Key Features:**

- **`id: TId | null`**: Every domain object has an ID. It can be `null` if the object doesn't represent real data yet (e.g., it's empty or hasn't been saved).
- **`isEmpty: boolean`**: This is a special flag that tells you if the object actually holds useful data (`false`) or if it's just an empty placeholder (`true`). This is part of the "Null Object Pattern."

**Example (`~/api/types/IDomain.ts`):**

```typescript
// src/api/types/IDomain.ts

/**
 * @interface IDomain
 * @description
 * A basic blueprint for all data objects in our app.
 * It ensures every object has an 'id' and a way to check if it's empty.
 */
export interface IDomain<TId = string> {
  readonly id: TId | null; // The object's unique ID, or null if empty
  readonly isEmpty: boolean; // True if this object holds no real data
}
```

---

## 2\. Your Data Objects (e.g., `BadgeDomain`)

You'll create a specific class for each type of data, like `BadgeDomain` for a badge. This class will follow the `IDomain` blueprint.

**What these classes do:**

- **Translate Data:** They take raw data from your API (which might have weird names or formats) and turn it into a clean, easy-to-use format for your app.
- **Add Logic:** They can include their own smart parts, like a way to get a shortened description or check if a user is active.
- **Provide an `empty()` version:** Each class has a special `empty()` method that gives you an empty placeholder object.

**Example (`~/domains/BadgeDomain.ts`):**

```typescript
// src/domains/BadgeDomain.ts

import type { IDomain } from "./IDomain"; // Path to your IDomain blueprint

// How raw badge data might look from the API
interface IApiBadgeData {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export class BadgeDomain implements IDomain<string> {
  public readonly id: string | null;
  public readonly name: string;
  public readonly description: string;
  public readonly created_at: string | null;
  public readonly updated_at: string | null;
  public readonly isEmpty: boolean; // Set to true for empty objects

  // Constructor is private, so you create objects using .create() or .empty()
  private constructor(data: IApiBadgeData | null) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.description = data.description;
      this.created_at = data.created_at || null;
      this.updated_at = data.updated_at || null;
      this.isEmpty = false; // This is a real object
    } else {
      // This is an empty placeholder object
      this.id = null;
      this.name = "";
      this.description = "";
      this.created_at = null;
      this.updated_at = null;
      this.isEmpty = true; // Mark as empty
    }
  }

  // Use this to create a real Badge object from API data
  static create(data: IApiBadgeData): BadgeDomain {
    return new BadgeDomain(data);
  }

  // Use this to get an empty Badge object (no real data)
  static empty(): BadgeDomain {
    // We use a single empty instance to save memory
    if (!(BadgeDomain as any)._emptyInstance) {
      (BadgeDomain as any)._emptyInstance = new BadgeDomain(null);
    }
    return (BadgeDomain as any)._emptyInstance;
  }

  // Example: A smart method inside the domain object
  get shortDescription(): string {
    return this.description.length > 50
      ? this.description.substring(0, 47) + "..."
      : this.description;
  }
}
```

---

## 3\. How This Helps Your App (Big Advantages)

This way of organizing your data simplifies your app's state management and how you show things on screen.

- **No More Annoying `null` Checks:**

  - You always start with an `empty()` domain object in your store (e.g., `currentBadge = BadgeDomain.empty()`).
  - This means `currentBadge` is _never_ `null` or `undefined`.
  - Instead of `if (currentBadge !== null)`, you simply check `if (currentBadge.isEmpty)`. This is much clearer and prevents common errors.

- **Your App Doesn't Care About API Changes:**

  - Your store and UI components only know about `BadgeDomain` (its `name`, `description`, `isEmpty`, etc.).
  - If your backend API changes its data format (e.g., `first_name` becomes `givenName`), you **only need to change the `BadgeDomain.create()` method**.
  - The rest of your app (your store's getters, your Vue components) remains untouched\! This saves a lot of work when APIs evolve.

- **Logic in the Right Place:**

  - All the rules for transforming raw API data into what your app needs happen in one spot (`Domain.create()`).
  - Any calculations or helper methods related to a badge (like `shortDescription`) live directly inside `BadgeDomain`. This keeps your code organized and easy to find.

- **Clearer UI Code:**

  - Your Vue components can directly use properties and methods from these domain objects (e.g., `{{ userStore.userProfile.fullName }}`, `v-if="!userStore.userProfile.isEmpty"`).
  - This makes your templates cleaner and easier to read, as they don't need complex logic to figure out if data exists or how to format it.

This pattern is a best practice for building strong, maintainable applications that can easily adapt to changes.
