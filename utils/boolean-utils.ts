// utils/boolean-utils.ts

/**
 * @class BooleanUtils
 * @description A utility class for performing common boolean operations
 * and validations in a chainable, fluent manner. Designed for easy use
 * without needing the 'new' keyword, and for straightforward retrieval
 * of the final boolean result.
 */
class BooleanUtils {
  /**
   * @private
   * @description The private instance variable to hold the current boolean value.
   */
  private currentBoolean: boolean;

  /**
   * @private constructor
   * @description The constructor is private. This enforces that new instances
   * are always created using the static `BooleanUtils.of()` factory method.
   * @param {boolean} initialValue The boolean to start chaining operations on.
   */
  private constructor(initialValue: boolean) {
    // Ensure the initial value is always treated as a boolean type.
    this.currentBoolean = Boolean(initialValue);
  }

  /**
   * @static
   * @method of
   * @description The primary way to create a new BooleanUtils instance and start a chain.
   * This method acts as a "factory," returning a new BooleanUtils object that's ready
   * for you to apply boolean operations to. It can convert truthy/falsy values to boolean.
   * @param {any} initialValue The value you want to begin manipulating (will be converted to boolean).
   * @returns {BooleanUtils} A new BooleanUtils instance, enabling method chaining.
   * @example
   * // Start a new boolean utility chain
   * BooleanUtils.of(true);
   * BooleanUtils.of(1); // Converts to true
   * BooleanUtils.of(""); // Converts to false
   */
  static of(initialValue: any): BooleanUtils {
    return new BooleanUtils(Boolean(initialValue));
  }

  /**
   * @method and
   * @description Performs a logical AND operation with the current boolean value and one or more other values.
   * All provided values will be converted to boolean.
   * @param {...any} values The values to logically AND with.
   * @returns {this} The current BooleanUtils instance for continued chaining.
   * @example
   * BooleanUtils.of(true).and(true).value; // true
   * BooleanUtils.of(true).and(false).value; // false
   * BooleanUtils.of(true).and(1, true, "hello").value; // true
   * BooleanUtils.of(true).and(1, false, "hello").value; // false
   */
  and(...values: any[]): this {
    for (const val of values) {
      this.currentBoolean = this.currentBoolean && Boolean(val);
    }
    return this;
  }

  /**
   * @method or
   * @description Performs a logical OR operation with the current boolean value and one or more other values.
   * All provided values will be converted to boolean.
   * @param {...any} values The values to logically OR with.
   * @returns {this} The current BooleanUtils instance for continued chaining.
   * @example
   * BooleanUtils.of(false).or(true).value; // true
   * BooleanUtils.of(false).or(false).value; // false
   * BooleanUtils.of(false).or(0, "", null).value; // false
   * BooleanUtils.of(false).or(0, "hello", null).value; // true
   */
  or(...values: any[]): this {
    for (const val of values) {
      this.currentBoolean = this.currentBoolean || Boolean(val);
    }
    return this;
  }

  /**
   * @method not
   * @description Performs a logical NOT operation on the current boolean value.
   * @returns {this} The current BooleanUtils instance for continued chaining.
   * @example
   * BooleanUtils.of(true).not().value; // false
   * BooleanUtils.of(false).not().value; // true
   */
  not(): this {
    this.currentBoolean = !this.currentBoolean;
    return this;
  }

  /**
   * @method xor
   * @description Performs a logical XOR (exclusive OR) operation with the current boolean value and another value.
   * Only one of the operands can be true for the result to be true.
   * @param {any} value The value to logically XOR with. Will be converted to boolean.
   * @returns {this} The current BooleanUtils instance for continued chaining.
   * @example
   * BooleanUtils.of(true).xor(false).value; // true
   * BooleanUtils.of(true).xor(true).value; // false
   * BooleanUtils.of(false).xor(true).value; // true
   * BooleanUtils.of(false).xor(false).value; // false
   */
  xor(value: any): this {
    this.currentBoolean = this.currentBoolean !== Boolean(value);
    return this;
  }

  /**
   * @method isTrue
   * @description Checks if the current boolean value is strictly `true`.
   * This method does not modify the boolean.
   * @returns {boolean} True if the value is `true`, false otherwise.
   * @example
   * BooleanUtils.of(true).isTrue(); // true
   * BooleanUtils.of(false).isTrue(); // false
   * BooleanUtils.of(1).isTrue(); // false (because it's not strictly 'true', even though it's truthy)
   */
  isTrue(): boolean {
    return this.currentBoolean === true;
  }

  /**
   * @method isFalse
   * @description Checks if the current boolean value is strictly `false`.
   * This method does not modify the boolean.
   * @returns {boolean} True if the value is `false`, false otherwise.
   * @example
   * BooleanUtils.of(false).isFalse(); // true
   * BooleanUtils.of(true).isFalse(); // false
   * BooleanUtils.of(0).isFalse(); // false (because it's not strictly 'false', even though it's falsy)
   */
  isFalse(): boolean {
    return this.currentBoolean === false;
  }

  /**
   * @method isTruthy
   * @description Checks if the current boolean value (or the initial value it was converted from) is truthy.
   * This method does not modify the boolean.
   * @returns {boolean} True if the value is truthy, false otherwise.
   * @example
   * BooleanUtils.of(true).isTruthy(); // true
   * BooleanUtils.of(1).isTruthy(); // true
   * BooleanUtils.of("hello").isTruthy(); // true
   * BooleanUtils.of(false).isTruthy(); // false
   * BooleanUtils.of(0).isTruthy(); // false
   * BooleanUtils.of("").isTruthy(); // false
   */
  isTruthy(): boolean {
    return Boolean(this.currentBoolean); // Simply re-evaluates the current boolean as truthy/falsy
  }

  /**
   * @method isFalsy
   * @description Checks if the current boolean value (or the initial value it was converted from) is falsy.
   * This method does not modify the boolean.
   * @returns {boolean} True if the value is falsy, false otherwise.
   * @example
   * BooleanUtils.of(false).isFalsy(); // true
   * BooleanUtils.of(0).isFalsy(); // true
   * BooleanUtils.of("").isFalsy(); // true
   * BooleanUtils.of(true).isFalsy(); // false
   * BooleanUtils.of(1).isFalsy(); // false
   * BooleanUtils.of("hello").isFalsy(); // false
   */
  isFalsy(): boolean {
    return !Boolean(this.currentBoolean); // Simply re-evaluates the current boolean as truthy/falsy
  }

  /**
   * @property {boolean} value
   * @description A getter property to retrieve the final boolean value after all chained operations.
   * Using it like a property (`.value`) makes the end of the chain very clear and readable.
   * @returns {boolean} The current boolean value stored in this BooleanUtils instance.
   */
  get value(): boolean {
    return this.currentBoolean;
  }

  /**
   * @method valueOf
   * @description Returns the final boolean value. This is a JavaScript built-in method
   * that allows the BooleanUtils object to be treated as its primitive boolean value
   * in certain contexts (e.g., when performing logical operations directly).
   * @returns {boolean} The current boolean value.
   */
  valueOf(): boolean {
    return this.currentBoolean;
  }

  /**
   * @method toString
   * @description Returns the string representation of the final boolean value.
   * This is a JavaScript built-in method often called when an object needs to be
   * represented as a string.
   * @returns {string} The string representation of the current boolean value ('true' or 'false').
   */
  toString(): string {
    return String(this.currentBoolean);
  }
}

// --- Example Usage ---

console.log("--- BooleanUtils Examples ---");

// Example 1: Basic chaining
const accessGranted = BooleanUtils.of(true)
  .and(true) // true
  .or(false) // true
  .not().value; // false
console.log("Access Granted:", accessGranted); // Output: false

// Example 2: Chaining with multiple arguments for AND/OR
const permissionCheck = BooleanUtils.of(true)
  .and(1, "admin", true) // true && true && true && true = true
  .or(0, null).value; // true || false || false = true
console.log("Permission Check:", permissionCheck); // Output: true

const anotherPermissionCheck = BooleanUtils.of(false)
  .or(false, "", 0) // false || false || false || false = false
  .and(true).value; // false && true = false
console.log("Another Permission Check:", anotherPermissionCheck); // Output: false

// Example 3: XOR operation
console.log("\n--- BooleanUtils XOR Examples ---");
console.log("True XOR False:", BooleanUtils.of(true).xor(false).value); // Output: true
console.log("True XOR True:", BooleanUtils.of(true).xor(true).value); // Output: false
console.log("False XOR True:", BooleanUtils.of(false).xor(true).value); // Output: true
console.log("False XOR False:", BooleanUtils.of(false).xor(false).value); // Output: false

// Example 4: Validation checks
console.log("\n--- BooleanUtils Validation Examples ---");
console.log("Is true strictly true?", BooleanUtils.of(true).isTrue()); // Output: true
console.log("Is false strictly false?", BooleanUtils.of(false).isFalse()); // Output: true
console.log("Is 1 strictly true?", BooleanUtils.of(1).isTrue()); // Output: false (because 1 is not `true` itself)
console.log("Is 0 strictly false?", BooleanUtils.of(0).isFalse()); // Output: false (because 0 is not `false` itself)

console.log("Is true truthy?", BooleanUtils.of(true).isTruthy()); // Output: true
console.log("Is 1 truthy?", BooleanUtils.of(1).isTruthy()); // Output: true
console.log("Is 'hello' truthy?", BooleanUtils.of("hello").isTruthy()); // Output: true
console.log("Is false truthy?", BooleanUtils.of(false).isTruthy()); // Output: false
console.log("Is 0 truthy?", BooleanUtils.of(0).isTruthy()); // Output: false
console.log("Is '' truthy?", BooleanUtils.of("").isTruthy()); // Output: false

console.log("Is false falsy?", BooleanUtils.of(false).isFalsy()); // Output: true
console.log("Is 0 falsy?", BooleanUtils.of(0).isFalsy()); // Output: true
console.log("Is '' falsy?", BooleanUtils.of("").isFalsy()); // Output: true
console.log("Is true falsy?", BooleanUtils.of(true).isFalsy()); // Output: false
console.log("Is 1 falsy?", BooleanUtils.of(1).isFalsy()); // Output: false
console.log("Is 'hello' falsy?", BooleanUtils.of("hello").isFalsy()); // Output: false

// Example 5: Chaining with mixed types
const complexCondition = BooleanUtils.of("active") // true
  .and(10 > 5) // true && true = true
  .or(null) // true || false = true
  .not() // false
  .xor(BooleanUtils.of(0).isFalsy()).value; // false XOR true = true
console.log("Complex Condition:", complexCondition); // Output: true

// Note: Validation methods (isTrue, isFalse, isTruthy, isFalsy) return a boolean
// and do not return 'this', as their purpose is to provide an answer,
// not to continue the boolean transformation chain.
