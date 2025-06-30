/**
 * @class StringUtils
 * @description A utility class for performing common string manipulations
 * in a chainable, fluent manner. Designed for easy use without needing
 * the 'new' keyword, and for straightforward retrieval of the final string.
 */
class StringUtils {
  /**
   * @private
   * @description The private instance variable to hold the current string value.
   */
  private currentString: string;

  /**
   * @private constructor
   * @description The constructor is private. This enforces that new instances
   * are always created using the static `StringUtils.of()` factory method.
   * This makes the API feel more like built-in JavaScript functions.
   * @param {string} initialValue The string to start chaining operations on.
   */
  private constructor(initialValue: string) {
    this.currentString = String(initialValue);
  }

  /**
   * @static
   * @method of
   * @description The primary way to create a new StringUtils instance and start a chain.
   * This method acts as a "factory," returning a new StringUtils object that's ready
   * for you to apply string operations to.
   * @param {string} initialValue The string you want to begin manipulating.
   * @returns {StringUtils} A new StringUtils instance, enabling method chaining.
   * @example
   * // Start a new string utility chain
   * StringUtils.of("  hello world  ")
   */
  static of(initialValue: string): StringUtils {
    return new StringUtils(initialValue);
  }

  /**
   * @method capitalize
   * @description Capitalizes the very first letter of the string.
   * For example, "hello" becomes "Hello".
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   */
  capitalize(): this {
    if (this.currentString.length === 0) {
      return this;
    }
    this.currentString = this.currentString.charAt(0).toUpperCase() + this.currentString.slice(1);
    return this;
  }

  /**
   * @method capitalizeWords
   * @description Capitalizes the first letter of each word in the string.
   * Words are typically separated by spaces.
   * For example, "hello world" becomes "Hello World".
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   */
  capitalizeWords(): this {
    this.currentString = this.currentString
      .split(" ")
      .map((word) =>
        word.length === 0 ? "" : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(" ");
    return this;
  }

  /**
   * @method toUpperCase
   * @description Converts the entire string to uppercase letters.
   * For example, "Hello" becomes "HELLO".
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   */
  toUpperCase(): this {
    this.currentString = this.currentString.toUpperCase();
    return this;
  }

  /**
   * @method toLowerCase
   * @description Converts the entire string to lowercase letters.
   * For example, "HELLO" becomes "hello".
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   */
  toLowerCase(): this {
    this.currentString = this.currentString.toLowerCase();
    return this;
  }

  /**
   * @method trim
   * @description Removes whitespace characters (like spaces, tabs, newlines)
   * from both the beginning and the end of the string.
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   * @remark
   * The built-in `String.prototype.trim()` method is highly optimized and
   * robust. It handles all whitespace characters defined by the Unicode
   * White_Space property, which includes regular spaces, tabs, newlines,
   * and various non-breaking space characters.
   * For most web development scenarios, the native `trim()`
   * is the recommended and most commonly used approach over regex.
   */
  trim(): this {
    this.currentString = this.currentString.trim();
    return this;
  }

  /**
   * @method replace
   * @description **Overload 1:** Replaces the first occurrence of `searchValue` with `replaceValue`.
   * @param {string | RegExp} searchValue The value to search for (a string or a regular expression).
   * @param {string} replaceValue The string to replace with.
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   */
  replace(searchValue: string | RegExp, replaceValue: string): this;
  /**
   * @method replace
   * @description **Overload 2:** Replaces occurrences of `searchValue` using a replacer function.
   * @param {string | RegExp} searchValue The value to search for (a string or a regular expression).
   * @param {(substring: string, ...args: any[]) => string} replacer
   * A function that returns the replacement string. Its arguments typically include the matched substring,
   * captured groups, and the offset of the match.
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   */
  replace(
    searchValue: string | RegExp,
    replacer: (substring: string, ...args: any[]) => string,
  ): this;
  /**
   * @method replace
   * @description **Implementation:** Handles both string and function replacements.
   * @param {string | RegExp} searchValue
   * @param {string | ((substring: string, ...args: any[]) => string)} replaceValue
   * @returns {StringUtils}
   */
  replace(
    searchValue: string | RegExp,
    replaceValue: string | ((substring: string, ...args: any[]) => string),
  ): this {
    this.currentString = this.currentString.replace(searchValue, replaceValue as any);
    return this;
  }

  /**
   * @method prepend
   * @description Adds a string to the beginning of the current string value.
   * @param {string} prefix The string to add before the current string.
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   */
  prepend(prefix: string): this {
    this.currentString = prefix + this.currentString;
    return this;
  }

  /**
   * @method append
   * @description Adds a string to the end of the current string value.
   * @param {string} suffix The string to add after the current string.
   * @returns {StringUtils} The current StringUtils instance for continued chaining.
   */
  append(suffix: string): this {
    this.currentString = this.currentString + suffix;
    return this;
  }

  /**
   * @method isEmpty
   * @description Checks if the current string is effectively empty, meaning it has a length of 0
   * after trimming any whitespace.
   * This method does not modify the string being chained.
   * @returns {boolean} True if the string is empty or contains only whitespace, false otherwise.
   * @example
   * StringUtils.of("").isEmpty(); // true
   * StringUtils.of("   ").isEmpty(); // true
   * StringUtils.of(" hello ").isEmpty(); // false
   */
  isEmpty(): boolean {
    return this.currentString.trim().length === 0;
  }

  /**
   * @method isLessThan
   * @description Checks if the length of the current string is less than a specified number.
   * This method does not modify the string.
   * @param {number} length The number to compare against.
   * @returns {boolean} True if the string's length is less than the given length, false otherwise.
   * @example
   * StringUtils.of("abc").isLessThan(5); // true
   * StringUtils.of("abcdef").isLessThan(5); // false
   */
  isLessThan(length: number): boolean {
    return this.currentString.length < length;
  }

  /**
   * @method isMoreThan
   * @description Checks if the length of the current string is more than a specified number.
   * This method does not modify the string.
   * @param {number} length The number to compare against.
   * @returns {boolean} True if the string's length is more than the given length, false otherwise.
   * @example
   * StringUtils.of("abcdef").isMoreThan(5); // true
   * StringUtils.of("abc").isMoreThan(5); // false
   */
  isMoreThan(length: number): boolean {
    return this.currentString.length > length;
  }

  /**
   * @method isEqual
   * @description Checks if the current string is exactly equal to another string.
   * This performs a case-sensitive comparison.
   * This method does not modify the string.
   * @param {string} compareString The string to compare against.
   * @returns {boolean} True if the strings are equal, false otherwise.
   * @example
   * StringUtils.of("hello").isEqual("hello"); // true
   * StringUtils.of("hello").isEqual("Hello"); // false
   */
  isEqual(compareString: string): boolean {
    return this.currentString === compareString;
  }

  /**
   * @property {string} value
   * @description A getter property to retrieve the final string value after all chained operations.
   * Using it like a property (`.value`) makes the end of the chain very clear and readable.
   * @returns {string} The current string value stored in this StringUtils instance.
   */
  get value(): string {
    return this.currentString;
  }

  /**
   * @method valueOf
   * @description Returns the final string value. This is a JavaScript built-in method
   * that allows the StringUtils object to be treated as its primitive string value
   * in certain contexts (e.g., when coercing to string).
   * @returns {string} The current string value.
   */
  valueOf(): string {
    return this.currentString;
  }

  /**
   * @method toString
   * @description Returns the final string value. This is another JavaScript built-in method
   * often called when an object needs to be represented as a string.
   * It's an alias for `valueOf()` in this class.
   * @returns {string} The current string value.
   */
  toString(): string {
    return this.currentString;
  }
}

// --- Example Usage ---

console.log("--- StringUtils Examples ---");

// Example 1: Basic chaining
const processedName = StringUtils.of("  ALICE SMITH  ")
  .trim() // "ALICE SMITH"
  .toLowerCase() // "alice smith"
  .capitalize() // "Alice smith"
  .replace("smith", "Jones").value; // "Alice Jones" // Get the final string

console.log("Processed Name:", processedName);

// Example 2: Prepending and Appending
const formattedTitle = StringUtils.of("My Article")
  .prepend("Read: ") // "Read: My Article"
  .append("!") // "Read: My Article!"
  .toUpperCase().value; // "READ: MY ARTICLE!"

console.log("Formatted Title:", formattedTitle);

// Example 3: Implicit string conversion (thanks to valueOf/toString)
// Note: While 'valueOf' and 'toString' exist, using '.value' is often more explicit.
const implicitString = StringUtils.of("test").trim();
console.log("Implicit String (might vary by JS engine):", "START_" + implicitString + "_END");

// Example 4: Chaining with replace (RegExp and string replacement)
const cleanText = StringUtils.of("  hello-world-123  ")
  .trim()
  .replace(/-/g, " ") // Replace all hyphens with spaces
  .capitalize().value;

console.log("Clean Text:", cleanText);

// Example 5: Chaining with replace (RegExp and function replacer)
const maskedEmail = StringUtils.of("user@example.com").replace(
  /^(.)(.*)(@.*)$/,
  (match, firstChar, middle, domain) => {
    return firstChar + "*".repeat(middle.length) + domain;
  },
).value;

console.log("Masked Email:", maskedEmail);

// Example 6: Capitalize Words
const titleCaseText = StringUtils.of("a short story about a brave knight").capitalizeWords().value;
console.log("Capitalized Words:", titleCaseText);

// --- Validation Examples ---
console.log("\n--- StringUtils Validation Examples ---");

const trulyEmptyString = StringUtils.of("");
console.log("Is empty ('')?", trulyEmptyString.isEmpty());

const whitespaceString = StringUtils.of("   \n\t");
console.log("Is empty ('   \\n\\t')?", whitespaceString.isEmpty());

const nonEmptyString = StringUtils.of(" hello ");
console.log("Is empty (' hello ')?", nonEmptyString.isEmpty());

const shortString = StringUtils.of("abc");
console.log("Is 'abc' less than 5?", shortString.isLessThan(5));
console.log("Is 'abc' more than 5?", shortString.isMoreThan(5));

const longString = StringUtils.of("superlongstring");
console.log("Is 'superlongstring' less than 10?", longString.isLessThan(10));
console.log("Is 'superlongstring' more than 10?", longString.isMoreThan(10));

const helloString = StringUtils.of("hello");
console.log("Is 'hello' equal to 'hello'?", helloString.isEqual("hello"));
console.log("Is 'hello' equal to 'Hello'?", helloString.isEqual("Hello"));

// Note: Validation methods like isEmpty, isLessThan, etc., don't return 'this'
// because their purpose is to provide a boolean answer, not to continue the string transformation chain.
