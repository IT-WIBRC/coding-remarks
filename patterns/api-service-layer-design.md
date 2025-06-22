# Architectural Pattern: API Service Layer Design

**Guideline:** Implement API calls using dedicated "service" classes with static methods, rather than embedding API logic directly within stores or components.

**Explanation:**

This establishes a robust "Service Layer" in your architecture, offering several advantages:

* **Clear Separation of Concerns:** Service classes are solely responsible for interacting with external APIs (e.g., Supabase, REST endpoints). Stores manage application state, and components render the UI. This clear division makes reasoning about your codebase much easier.
* **Enhanced Testability:** Static methods are inherently easier to unit test in isolation. You can mock the service methods without needing to set up complex store or component states.
* **Reusability:** Service methods can be easily reused across different stores, composables, or even independent scripts if needed, promoting a DRY (Don't Repeat Yourself) codebase.
* **Consistent Error Handling:** By utilizing a wrapper function (like `wrapServiceCall` discussed in [Monads: Either and Maybe](./monads-either-maybe.md)) within your service methods, all API interactions benefit from standardized error mapping and response parsing. This centralizes how raw backend responses are translated into a consistent frontend format.

**Example:**

```typescript
// userService.ts
import supabase from './supabaseClient'; // Your configured Supabase client
import { wrapServiceCall } from '~/utils/wrapServiceCall'; // Your API wrapper

export class UserService {
  static async getUserProfile(userId: string) {
    return wrapServiceCall(
      supabase.from('profiles').select('*').eq('id', userId).single()
    );
  }

  static async updateUserName(userId: string, newName: string) {
    return wrapServiceCall(
      supabase.from('profiles').update({ name: newName }).eq('id', userId).single()
    );
  }
}

// In a store:
import { UserService } from '~/services/userService';
import { handleSingleItemResponse } from '~/utils/serviceResponseUtilities'; // For consuming wrapper result

class ProfileStore {
  userProfile = ref(null); // Assuming Vue's ref

  async fetchProfile(userId: string) {
    const wrapperResponse = await UserService.getUserProfile(userId);

    // handleSingleItemResponse abstracts the error/success/data-null checks
    return handleSingleItemResponse(wrapperResponse, {
      onFound: (data) => {
        this.userProfile.value = data;
        return { status: "success", data };
      },
      onNotFound: () => ({ status: "error", message: "Profile not found." }),
      onError: (message) => ({ status: "error", message }),
    });
  }
}