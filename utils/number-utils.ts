/**
 * @class NumberUtils
 * @description A utility class for performing common number manipulations
 * in a chainable, fluent manner. Designed for easy use without needing
 * the 'new' keyword, and for straightforward retrieval of the final number.
 */
class NumberUtils {
  /**
   * @private
   * @description The private instance variable to hold the current number value.
   */
  private currentNumber: number;

  /**
   * @private constructor
   * @description The constructor is private. This enforces that new instances
   * are always created using the static `NumberUtils.of()` factory method.
   * @param {number} initialValue The number to start chaining operations on.
   */
  private constructor(initialValue: number) {
    // Ensure the initial value is always treated as a number type.
    // Use Number() constructor for robust conversion, handling potential non-numeric inputs gracefully.
    this.currentNumber = Number(initialValue);
  }

  /**
   * @static
   * @method of
   * @description The primary way to create a new NumberUtils instance and start a chain.
   * This method acts as a "factory," returning a new NumberUtils object that's ready
   * for you to apply number operations to.
   * @param {number} initialValue The number you want to begin manipulating.
   * @returns {NumberUtils} A new NumberUtils instance, enabling method chaining.
   * @example
   * // Start a new number utility chain
   * NumberUtils.of(123.456)
   */
  static of(initialValue: number): NumberUtils {
    return new NumberUtils(initialValue);
  }

  /**
   * @method add
   * @description Adds one or more numbers to the current value.
   * @param {...number} nums The numbers to add.
   * @returns {this} The current NumberUtils instance for continued chaining.
   * @example
   * NumberUtils.of(10).add(5).value; // 15
   * NumberUtils.of(10).add(1, 2, 3).value; // 16
   */
  add(...nums: number[]): this {
    for (const num of nums) {
      this.currentNumber += Number(num);
    }
    return this;
  }

  /**
   * @method subtract
   * @description Subtracts one or more numbers from the current value.
   * @param {...number} nums The numbers to subtract.
   * @returns {this} The current NumberUtils instance for continued chaining.
   * @example
   * NumberUtils.of(10).subtract(3).value; // 7
   * NumberUtils.of(10).subtract(1, 2, 3).value; // 4
   */
  subtract(...nums: number[]): this {
    for (const num of nums) {
      this.currentNumber -= Number(num);
    }
    return this;
  }

  /**
   * @method multiply
   * @description Multiplies the current value by one or more numbers.
   * @param {...number} nums The numbers to multiply by.
   * @returns {this} The current NumberUtils instance for continued chaining.
   * @example
   * NumberUtils.of(5).multiply(4).value; // 20
   * NumberUtils.of(2).multiply(3, 4).value; // 24 (2 * 3 * 4)
   */
  multiply(...nums: number[]): this {
    for (const num of nums) {
      this.currentNumber *= Number(num);
    }
    return this;
  }

  /**
   * @method divide
   * @description Divides the current value by a number. Handles division by zero by returning Infinity or -Infinity.
   * @param {number} num The number to divide by.
   * @returns {this} The current NumberUtils instance for continued chaining.
   * @example
   * NumberUtils.of(10).divide(2).value; // 5
   * NumberUtils.of(10).divide(0).value; // Infinity
   */
  divide(num: number): this {
    if (Number(num) === 0) {
      this.currentNumber = this.currentNumber / Number(num); // Will result in Infinity, -Infinity, or NaN
    } else {
      this.currentNumber /= Number(num);
    }
    return this;
  }

  /**
   * @method round
   * @description Rounds the current number to the nearest integer.
   * @returns {this} The current NumberUtils instance for continued chaining.
   * @example
   * NumberUtils.of(3.7).round().value; // 4
   * NumberUtils.of(3.2).round().value; // 3
   */
  round(): this {
    this.currentNumber = Math.round(this.currentNumber);
    return this;
  }

  /**
   * @method floor
   * @description Rounds the current number down to the nearest integer.
   * @returns {this} The current NumberUtils instance for continued chaining.
   * @example
   * NumberUtils.of(3.7).floor().value; // 3
   * NumberUtils.of(3.2).floor().value; // 3
   * NumberUtils.of(-3.7).floor().value; // -4
   */
  floor(): this {
    this.currentNumber = Math.floor(this.currentNumber);
    return this;
  }

  /**
   * @method ceil
   * @description Rounds the current number up to the nearest integer.
   * @returns {this} The current NumberUtils instance for continued chaining.
   * @example
   * NumberUtils.of(3.2).ceil().value; // 4
   * NumberUtils.of(3.7).ceil().value; // 4
   * NumberUtils.of(-3.2).ceil().value; // -3
   */
  ceil(): this {
    this.currentNumber = Math.ceil(this.currentNumber);
    return this;
  }

  /**
   * @method toFixed
   * @description Formats the current number to a fixed number of decimal places.
   * Returns a string representation of the number.
   * @param {number} [digits=0] The number of digits to appear after the decimal point.
   * @returns {this} The current NumberUtils instance for continued chaining (stores as a number, might lose precision if re-converted).
   * @remark
   * This method converts the number to a string internally. If you chain further numerical operations
   * after `toFixed`, the string will be implicitly converted back to a number, which might
   * lead to loss of trailing zeros or precision if not handled carefully.
   * For final display, it's often best to call `.value` after `toFixed` and use the string result.
   * @example
   * NumberUtils.of(123.456).toFixed(2).value; // "123.46" (as a string)
   * NumberUtils.of(10).toFixed(2).value; // "10.00" (as a string)
   */
  toFixed(digits: number = 0): this {
    this.currentNumber = parseFloat(this.currentNumber.toFixed(digits));
    return this;
  }

  /**
   * @method toPrecision
   * @description Formats the current number to a specified length (number of significant digits).
   * Returns a string representation of the number.
   * @param {number} [precision] The number of significant digits.
   * @returns {this} The current NumberUtils instance for continued chaining (stores as a number, might lose precision if re-converted).
   * @remark
   * Similar to `toFixed`, this method converts to a string. Be mindful of subsequent numerical operations.
   * @example
   * NumberUtils.of(123.456).toPrecision(4).value; // "123.5" (as a string)
   * NumberUtils.of(0.000123).toPrecision(2).value; // "0.00012" (as a string)
   */
  toPrecision(precision?: number): this {
    this.currentNumber = parseFloat(this.currentNumber.toPrecision(precision));
    return this;
  }

  /**
   * @method clamp
   * @description Restricts the current number to be within a specified minimum and maximum range.
   * If the number is less than `min`, it becomes `min`. If it's greater than `max`, it becomes `max`.
   * @param {number} min The minimum allowed value.
   * @param {number} max The maximum allowed value.
   * @returns {this} The current NumberUtils instance for continued chaining.
   * @example
   * NumberUtils.of(5).clamp(10, 20).value; // 10
   * NumberUtils.of(25).clamp(10, 20).value; // 20
   * NumberUtils.of(15).clamp(10, 20).value; // 15
   */
  clamp(min: number, max: number): this {
    this.currentNumber = Math.max(Number(min), Math.min(Number(max), this.currentNumber));
    return this;
  }

  /**
   * @method isInteger
   * @description Checks if the current number is an integer.
   * This method does not modify the number.
   * @returns {boolean} True if the number is an integer, false otherwise.
   * @example
   * NumberUtils.of(5).isInteger(); // true
   * NumberUtils.of(5.5).isInteger(); // false
   */
  isInteger(): boolean {
    return Number.isInteger(this.currentNumber);
  }

  /**
   * @method isPositive
   * @description Checks if the current number is strictly positive (greater than 0).
   * This method does not modify the number.
   * @returns {boolean} True if the number is positive, false otherwise.
   * @example
   * NumberUtils.of(10).isPositive(); // true
   * NumberUtils.of(-5).isPositive(); // false
   * NumberUtils.of(0).isPositive(); // false
   */
  isPositive(): boolean {
    return this.currentNumber > 0;
  }

  /**
   * @method isNegative
   * @description Checks if the current number is strictly negative (less than 0).
   * This method does not modify the number.
   * @returns {boolean} True if the number is negative, false otherwise.
   * @example
   * NumberUtils.of(-10).isNegative(); // true
   * NumberUtils.of(5).isNegative(); // false
   * NumberUtils.of(0).isNegative(); // false
   */
  isNegative(): boolean {
    return this.currentNumber < 0;
  }

  /**
   * @method isZero
   * @description Checks if the current number is exactly zero.
   * This method does not modify the number.
   * @returns {boolean} True if the number is zero, false otherwise.
   * @example
   * NumberUtils.of(0).isZero(); // true
   * NumberUtils.of(0.0).isZero(); // true
   * NumberUtils.of(1).isZero(); // false
   */
  isZero(): boolean {
    return this.currentNumber === 0;
  }

  /**
   * @method isNaN
   * @description Checks if the current number is `NaN` (Not-a-Number).
   * This method does not modify the number.
   * @returns {boolean} True if the number is `NaN`, false otherwise.
   * @example
   * NumberUtils.of(NaN).isNaN(); // true
   * NumberUtils.of(123).isNaN(); // false
   * NumberUtils.of(Infinity).isNaN(); // false
   */
  isNaN(): boolean {
    return Number.isNaN(this.currentNumber);
  }

  /**
   * @method isLessThan
   * @description Checks if the current number is strictly less than a specified value.
   * This method does not modify the number.
   * @param {number} compareValue The value to compare against.
   * @returns {boolean} True if the current number is less than `compareValue`, false otherwise.
   * @example
   * NumberUtils.of(5).isLessThan(10); // true
   * NumberUtils.of(10).isLessThan(10); // false
   * NumberUtils.of(15).isLessThan(10); // false
   */
  isLessThan(compareValue: number): boolean {
    return this.currentNumber < Number(compareValue);
  }

  /**
   * @method isMoreThan
   * @description Checks if the current number is strictly more than a specified value.
   * This method does not modify the number.
   * @param {number} compareValue The value to compare against.
   * @returns {boolean} True if the current number is more than `compareValue`, false otherwise.
   * @example
   * NumberUtils.of(15).isMoreThan(10); // true
   * NumberUtils.of(10).isMoreThan(10); // false
   * NumberUtils.of(5).isMoreThan(10); // false
   */
  isMoreThan(compareValue: number): boolean {
    return this.currentNumber > Number(compareValue);
  }

  /**
   * @method isEqual
   * @description Checks if the current number is exactly equal to a specified value.
   * This method does not modify the number.
   * @param {number} compareValue The value to compare against.
   * @returns {boolean} True if the current number is equal to `compareValue`, false otherwise.
   * @example
   * NumberUtils.of(10).isEqual(10); // true
   * NumberUtils.of(10.0).isEqual(10); // true
   * NumberUtils.of(10.1).isEqual(10); // false
   */
  isEqual(compareValue: number): boolean {
    return this.currentNumber === Number(compareValue);
  }

  /**
   * @method isBetween
   * @description Checks if the current number is within a specified range (inclusive of min and max).
   * This method does not modify the number.
   * @param {number} min The minimum value of the range.
   * @param {number} max The maximum value of the range.
   * @returns {boolean} True if the number is within the range, false otherwise.
   * @example
   * NumberUtils.of(15).isBetween(10, 20); // true
   * NumberUtils.of(10).isBetween(10, 20); // true
   * NumberUtils.of(20).isBetween(10, 20); // true
   * NumberUtils.of(5).isBetween(10, 20); // false
   */
  isBetween(min: number, max: number): boolean {
    return this.currentNumber >= Number(min) && this.currentNumber <= Number(max);
  }

  /**
   * @method isEven
   * @description Checks if the current number is an even integer.
   * This method does not modify the number.
   * @returns {boolean} True if the number is an even integer, false otherwise.
   * @example
   * NumberUtils.of(4).isEven(); // true
   * NumberUtils.of(5).isEven(); // false
   * NumberUtils.of(0).isEven(); // true
   * NumberUtils.of(4.2).isEven(); // false (not an integer)
   */
  isEven(): boolean {
    return this.isInteger() && this.currentNumber % 2 === 0;
  }

  /**
   * @method isOdd
   * @description Checks if the current number is an odd integer.
   * This method does not modify the number.
   * @returns {boolean} True if the number is an odd integer, false otherwise.
   * @example
   * NumberUtils.of(5).isOdd(); // true
   * NumberUtils.of(4).isOdd(); // false
   * NumberUtils.of(0).isOdd(); // false (even)
   * NumberUtils.of(5.2).isOdd(); // false (not an integer)
   */
  isOdd(): boolean {
    return this.isInteger() && this.currentNumber % 2 !== 0;
  }

  /**
   * @method isFinite
   * @description Checks if the current number is a finite number (not Infinity, -Infinity, or NaN).
   * This method does not modify the number.
   * @returns {boolean} True if the number is finite, false otherwise.
   * @example
   * NumberUtils.of(10).isFinite(); // true
   * NumberUtils.of(Infinity).isFinite(); // false
   * NumberUtils.of(NaN).isFinite(); // false
   */
  isFinite(): boolean {
    return Number.isFinite(this.currentNumber);
  }

  /**
   * @method isDivisibleBy
   * @description Checks if the current number is perfectly divisible by a given divisor (remainder is 0).
   * Handles division by zero for the divisor.
   * This method does not modify the number.
   * @param {number} divisor The number to divide by.
   * @returns {boolean} True if divisible, false otherwise. Returns false if divisor is 0.
   * @example
   * NumberUtils.of(10).isDivisibleBy(2); // true
   * NumberUtils.of(10).isDivisibleBy(3); // false
   * NumberUtils.of(10).isDivisibleBy(0); // false
   */
  isDivisibleBy(divisor: number): boolean {
    if (Number(divisor) === 0) {
      return false; // Cannot divide by zero
    }
    return this.currentNumber % Number(divisor) === 0;
  }

  /**
   * @property {number} value
   * @description A getter property to retrieve the final number value after all chained operations.
   * Using it like a property (`.value`) makes the end of the chain very clear and readable.
   * @returns {number} The current number value stored in this NumberUtils instance.
   */
  get value(): number {
    return this.currentNumber;
  }

  /**
   * @method valueOf
   * @description Returns the final number value. This is a JavaScript built-in method
   * that allows the NumberUtils object to be treated as its primitive number value
   * in certain contexts (e.g., when performing arithmetic operations directly).
   * @returns {number} The current number value.
   */
  valueOf(): number {
    return this.currentNumber;
  }

  /**
   * @method toString
   * @description Returns the string representation of the final number value.
   * This is a JavaScript built-in method often called when an object needs to be
   * represented as a string.
   * @returns {string} The string representation of the current number value.
   */
  toString(): string {
    return String(this.currentNumber);
  }
}

// --- Example Usage ---

console.log("--- NumberUtils Examples ---");

// Example 1: Basic arithmetic and rounding (single argument)
const calculatedValue = NumberUtils.of(10.5)
  .add(2.3) // 12.8
  .multiply(3) // 38.4
  .floor().value; // 38
console.log("Calculated Value (10.5 + 2.3) * 3 floor:", calculatedValue);

// Example 2: Arithmetic with multiple arguments
const multiAdd = NumberUtils.of(10).add(1, 2, 3, 4).value;
console.log("Multi-Add (10 + 1 + 2 + 3 + 4):", multiAdd);

const multiSubtract = NumberUtils.of(100).subtract(10, 5, 20).value;
console.log("Multi-Subtract (100 - 10 - 5 - 20):", multiSubtract);

const multiMultiply = NumberUtils.of(2).multiply(3, 4, 5).value;
console.log("Multi-Multiply (2 * 3 * 4 * 5):", multiMultiply);

// Example 3: Formatting decimals
const formattedPrice = NumberUtils.of(99.9987).toFixed(2).value;
console.log("Formatted Price (toFixed 2):", formattedPrice);

const preciseMeasurement = NumberUtils.of(12345.6789).toPrecision(5).value;
console.log("Precise Measurement (toPrecision 5):", preciseMeasurement);

// Example 4: Clamping a value
const clampedAge = NumberUtils.of(5).clamp(18, 65).value;
console.log("Clamped Age (5 clamped to 18-65):", clampedAge);

const clampedScore = NumberUtils.of(105).clamp(0, 100).value;
console.log("Clamped Score (105 clamped to 0-100):", clampedScore);

// Example 5: Core Validation checks
console.log("\n--- NumberUtils Core Validation Examples ---");
console.log("Is 7 an integer?", NumberUtils.of(7).isInteger());
console.log("Is 3.14 an integer?", NumberUtils.of(3.14).isInteger());
console.log("Is -5 positive?", NumberUtils.of(-5).isPositive());
console.log("Is -5 negative?", NumberUtils.of(-5).isNegative());
console.log("Is 0 zero?", NumberUtils.of(0).isZero());
console.log("Is NaN NaN?", NumberUtils.of(NaN).isNaN());
console.log("Is 'abc' NaN (after conversion)?", NumberUtils.of("abc" as any).isNaN());

// New validation methods
console.log("\n--- NumberUtils Additional Validation Examples ---");
console.log("Is 5 less than 10?", NumberUtils.of(5).isLessThan(10));
console.log("Is 10 less than 10?", NumberUtils.of(10).isLessThan(10));
console.log("Is 15 more than 10?", NumberUtils.of(15).isMoreThan(10));
console.log("Is 10 more than 10?", NumberUtils.of(10).isMoreThan(10));
console.log("Is 7 equal to 7?", NumberUtils.of(7).isEqual(7));
console.log("Is 7 equal to 7.0?", NumberUtils.of(7.0).isEqual(7));
console.log("Is 7 equal to 8?", NumberUtils.of(7).isEqual(8));

console.log("Is 15 between 10 and 20?", NumberUtils.of(15).isBetween(10, 20)); // true
console.log("Is 10 between 10 and 20?", NumberUtils.of(10).isBetween(10, 20)); // true
console.log("Is 20 between 10 and 20?", NumberUtils.of(20).isBetween(10, 20)); // true
console.log("Is 5 between 10 and 20?", NumberUtils.of(5).isBetween(10, 20)); // false

console.log("Is 4 even?", NumberUtils.of(4).isEven()); // true
console.log("Is 5 even?", NumberUtils.of(5).isEven()); // false
console.log("Is 0 even?", NumberUtils.of(0).isEven()); // true
console.log("Is 4.2 even?", NumberUtils.of(4.2).isEven()); // false

console.log("Is 5 odd?", NumberUtils.of(5).isOdd()); // true
console.log("Is 4 odd?", NumberUtils.of(4).isOdd()); // false
console.log("Is 0 odd?", NumberUtils.of(0).isOdd()); // false
console.log("Is 5.2 odd?", NumberUtils.of(5.2).isOdd()); // false

console.log("Is 10 finite?", NumberUtils.of(10).isFinite()); // true
console.log("Is Infinity finite?", NumberUtils.of(Infinity).isFinite()); // false
console.log("Is NaN finite?", NumberUtils.of(NaN).isFinite()); // false

console.log("Is 10 divisible by 2?", NumberUtils.of(10).isDivisibleBy(2)); // true
console.log("Is 10 divisible by 3?", NumberUtils.of(10).isDivisibleBy(3)); // false
console.log("Is 10 divisible by 0?", NumberUtils.of(10).isDivisibleBy(0)); // false

// Example 6: Chaining with mixed operations and checks
const finalCheck = NumberUtils.of(100)
  .divide(3) // 33.333...
  .add(0.666) // 33.999...
  .round(); // 34 (now the currentNumber is 34)

console.log("Final Check Value:", finalCheck.value);
console.log("Is Final Check Value an integer?", finalCheck.isInteger());

// Note: Validation methods (isInteger, isPositive, etc.) return a boolean
// and do not return 'this', as their purpose is to provide an answer,
// not to continue the number transformation chain.
