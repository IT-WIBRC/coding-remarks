/**
 * @class MoneyUtils
 * @description A utility class for performing precise monetary calculations
 * and formatting in a chainable, fluent manner. It internally handles values
 * as integers (e.g., cents) to avoid floating-point inaccuracies common
 * with decimal numbers in JavaScript.
 */
class MoneyUtils {
  /**
   * @private
   * @description The internal number value, stored as an integer representing
   * the smallest unit (e.g., cents, where 100 cents = 1 unit of currency).
   */
  private _cents: number;

  /**
   * @private
   * @description The number of decimal places used for the currency,
   * determining the scaling factor (e.g., 2 for cents, 3 for mills).
   * This defines `10^scale` as the multiplier to convert to/from integer.
   */
  private _scale: number;

  /**
   * @private
   * @description The currency code (e.g., 'USD', 'EUR').
   */
  private _currency: string;

  /**
   * @private constructor
   * @description The constructor is private to enforce that new instances
   * are always created using the static `MoneyUtils.of()` factory method.
   * @param {number} cents The initial amount in the smallest currency unit (e.g., cents).
   * @param {string} currency The currency code (e.g., 'USD').
   * @param {number} scale The number of decimal places for the currency.
   */
  private constructor(cents: number, currency: string, scale: number) {
    this._cents = Math.round(cents); // Ensure it's an integer
    this._currency = currency;
    this._scale = Math.max(0, Math.floor(scale)); // Scale must be a non-negative integer
  }

  /**
   * @static
   * @method of
   * @description The primary way to create a new MoneyUtils instance and start a chain.
   * This method converts a decimal number or string into the internal integer representation.
   * @param {number | string} initialValue The initial monetary value (e.g., 123.45 or "123.45").
   * @param {string} [currency='USD'] The currency code (e.g., 'USD', 'EUR'). Defaults to 'USD'.
   * @param {number} [scale=2] The number of decimal places for the currency (e.g., 2 for cents). Defaults to 2.
   * @returns {MoneyUtils} A new MoneyUtils instance, enabling method chaining.
   * @example
   * MoneyUtils.of(123.45, 'USD'); // Represents $123.45
   * MoneyUtils.of("50.75", 'EUR', 2); // Represents €50.75
   * MoneyUtils.of(1000, 'JPY', 0); // Represents ¥1000 (no decimals)
   */
  static of(
    initialValue: number | string,
    currency: string = "USD",
    scale: number = 2,
  ): MoneyUtils {
    const numValue = parseFloat(String(initialValue));
    if (Number.isNaN(numValue)) {
      // Handle invalid input gracefully, perhaps by initializing to zero
      return new MoneyUtils(0, currency, scale);
    }
    const cents = numValue * 10 ** scale;
    return new MoneyUtils(cents, currency, scale);
  }

  /**
   * @private
   * @method _toCents
   * @description Converts an input value (number, string, or MoneyUtils instance)
   * to its internal cents representation, considering its scale.
   * @param {number | string | MoneyUtils} amount The amount to convert.
   * @param {number} [targetScale] Optional scale to use for conversion. Defaults to this instance's scale.
   * @returns {number} The amount in cents.
   */
  private _toCents(amount: number | string | MoneyUtils, targetScale?: number): number {
    const scale = targetScale !== undefined ? targetScale : this._scale;
    if (amount instanceof MoneyUtils) {
      // If it's another MoneyUtils, convert its value to our scale
      return Math.round(amount.value * 10 ** scale);
    }
    const numValue = parseFloat(String(amount));
    if (Number.isNaN(numValue)) {
      return 0;
    }
    return Math.round(numValue * 10 ** scale);
  }

  /**
   * @method add
   * @description Adds one or more monetary amounts to the current value.
   * Amounts can be numbers, strings, or other MoneyUtils instances.
   * @param {...(number | string | MoneyUtils)} amounts The amounts to add.
   * @returns {this} The current MoneyUtils instance for continued chaining.
   * @example
   * MoneyUtils.of(10).add(5).value; // 15
   * MoneyUtils.of(10).add(1, "2.50", MoneyUtils.of(3)).value; // 16.5
   */
  add(...amounts: (number | string | MoneyUtils)[]): this {
    for (const amount of amounts) {
      this._cents += this._toCents(amount);
    }
    return this;
  }

  /**
   * @method subtract
   * @description Subtracts one or more monetary amounts from the current value.
   * Amounts can be numbers, strings, or other MoneyUtils instances.
   * @param {...(number | string | MoneyUtils)} amounts The amounts to subtract.
   * @returns {this} The current MoneyUtils instance for continued chaining.
   * @example
   * MoneyUtils.of(10).subtract(3).value; // 7
   * MoneyUtils.of(10).subtract(1, "2.50", MoneyUtils.of(3)).value; // 3.5
   */
  subtract(...amounts: (number | string | MoneyUtils)[]): this {
    for (const amount of amounts) {
      this._cents -= this._toCents(amount);
    }
    return this;
  }

  /**
   * @method multiply
   * @description Multiplies the current value by a number.
   * @param {number | string} multiplier The number to multiply by.
   * @returns {this} The current MoneyUtils instance for continued chaining.
   * @example
   * MoneyUtils.of(5).multiply(4).value; // 20
   * MoneyUtils.of(2.50).multiply(3).value; // 7.50
   */
  multiply(multiplier: number | string): this {
    const numMultiplier = parseFloat(String(multiplier));
    if (Number.isNaN(numMultiplier)) {
      return this; // Do nothing if multiplier is invalid
    }
    // Multiply cents directly, then re-round to maintain precision
    this._cents = Math.round(this._cents * numMultiplier);
    return this;
  }

  /**
   * @method divide
   * @description Divides the current value by a number. Handles division by zero by returning an instance with 0 cents.
   * @param {number | string} divisor The number to divide by.
   * @returns {this} The current MoneyUtils instance for continued chaining.
   * @example
   * MoneyUtils.of(10).divide(2).value; // 5
   * MoneyUtils.of(10).divide(0).value; // 0 (handles division by zero)
   * MoneyUtils.of(7.50).divide(2).value; // 3.75
   */
  divide(divisor: number | string): this {
    const numDivisor = parseFloat(String(divisor));
    if (Number.isNaN(numDivisor) || numDivisor === 0) {
      this._cents = 0; // Set to zero for invalid or zero division
    } else {
      // Divide cents directly, then re-round to maintain precision
      this._cents = Math.round(this._cents / numDivisor);
    }
    return this;
  }

  /**
   * @method toPercentage
   * @description Calculates a percentage of the current monetary value.
   * For example, `MoneyUtils.of(100).toPercentage(5).value` would be 5.
   * @param {number | string} percentage The percentage value (e.g., 5 for 5%).
   * @returns {this} The current MoneyUtils instance for continued chaining.
   * @example
   * MoneyUtils.of(200).toPercentage(10).value; // 20
   * MoneyUtils.of(50).toPercentage(200).value; // 100
   */
  toPercentage(percentage: number | string): this {
    const numPercentage = parseFloat(String(percentage));
    if (Number.isNaN(numPercentage)) {
      return this;
    }
    // Calculate percentage: (currentCents * percentage) / 100
    this._cents = Math.round(this._cents * (numPercentage / 100));
    return this;
  }

  /**
   * @method addPercentage
   * @description Adds a percentage of the current monetary value to itself.
   * For example, `MoneyUtils.of(100).addPercentage(5).value` would be 105.
   * @param {number | string} percentage The percentage value (e.g., 5 for 5%).
   * @returns {this} The current MoneyUtils instance for continued chaining.
   * @example
   * MoneyUtils.of(100).addPercentage(10).value; // 110
   * MoneyUtils.of(50).addPercentage(50).value; // 75
   */
  addPercentage(percentage: number | string): this {
    const numPercentage = parseFloat(String(percentage));
    if (Number.isNaN(numPercentage)) {
      return this;
    }
    // currentCents * (1 + percentage / 100)
    this._cents = Math.round(this._cents * (1 + numPercentage / 100));
    return this;
  }

  /**
   * @method subtractPercentage
   * @description Subtracts a percentage of the current monetary value from itself.
   * For example, `MoneyUtils.of(100).subtractPercentage(5).value` would be 95.
   * @param {number | string} percentage The percentage value (e.g., 5 for 5%).
   * @returns {this} The current MoneyUtils instance for continued chaining.
   * @example
   * MoneyUtils.of(100).subtractPercentage(10).value; // 90
   * MoneyUtils.of(50).subtractPercentage(50).value; // 25
   */
  subtractPercentage(percentage: number | string): this {
    const numPercentage = parseFloat(String(percentage));
    if (Number.isNaN(numPercentage)) {
      return this;
    }
    // currentCents * (1 - percentage / 100)
    this._cents = Math.round(this._cents * (1 - numPercentage / 100));
    return this;
  }

  /**
   * @method format
   * @description Formats the current monetary value into a locale-specific currency string.
   * @param {string} [locale] The locale string (e.g., 'en-US', 'de-DE'). Defaults to current browser locale.
   * @param {Intl.NumberFormatOptions} [options] Optional formatting options for `Intl.NumberFormat`.
   * @returns {string} The formatted currency string.
   * @example
   * MoneyUtils.of(1234.56, 'USD').format('en-US'); // "$1,234.56"
   * MoneyUtils.of(1234.56, 'EUR').format('de-DE'); // "1.234,56 €"
   * MoneyUtils.of(1234.56, 'USD').format('en-US', { style: 'currency', currencyDisplay: 'name' }); // "1,234.56 US dollars"
   */
  format(locale?: string, options?: Intl.NumberFormatOptions): string {
    const numberFormatterOptions: Intl.NumberFormatOptions = {
      style: "currency",
      currency: this._currency,
      minimumFractionDigits: this._scale,
      maximumFractionDigits: this._scale,
      ...options, // Allow overriding default options
    };

    try {
      return new Intl.NumberFormat(locale, numberFormatterOptions).format(this.value);
    } catch (e) {
      console.error("Error formatting currency:", e);
      // Fallback to a simple string if formatting fails
      return `${this._currency} ${this.value.toFixed(this._scale)}`;
    }
  }

  /**
   * @method isZero
   * @description Checks if the current monetary value is exactly zero.
   * @returns {boolean} True if the value is zero, false otherwise.
   * @example
   * MoneyUtils.of(0).isZero(); // true
   * MoneyUtils.of(0.001).isZero(); // false
   */
  isZero(): boolean {
    return this._cents === 0;
  }

  /**
   * @method isPositive
   * @description Checks if the current monetary value is strictly positive (greater than zero).
   * @returns {boolean} True if the value is positive, false otherwise.
   * @example
   * MoneyUtils.of(10).isPositive(); // true
   * MoneyUtils.of(-5).isPositive(); // false
   * MoneyUtils.of(0).isPositive(); // false
   */
  isPositive(): boolean {
    return this._cents > 0;
  }

  /**
   * @method isNegative
   * @description Checks if the current monetary value is strictly negative (less than zero).
   * @returns {boolean} True if the value is negative, false otherwise.
   * @example
   * MoneyUtils.of(-10).isNegative(); // true
   * MoneyUtils.of(5).isNegative(); // false
   * MoneyUtils.of(0).isNegative(); // false
   */
  isNegative(): boolean {
    return this._cents < 0;
  }

  /**
   * @method isEqual
   * @description Checks if the current monetary value is exactly equal to another amount.
   * Compares based on the internal cents value.
   * @param {number | string | MoneyUtils} other The amount to compare against.
   * @returns {boolean} True if the values are equal, false otherwise.
   * @example
   * MoneyUtils.of(10).isEqual(10); // true
   * MoneyUtils.of(10.00).isEqual("10"); // true
   * MoneyUtils.of(10.50).isEqual(MoneyUtils.of(10.5)); // true
   */
  isEqual(other: number | string | MoneyUtils): boolean {
    return this._cents === this._toCents(other);
  }

  /**
   * @method isLessThan
   * @description Checks if the current monetary value is strictly less than another amount.
   * Compares based on the internal cents value.
   * @param {number | string | MoneyUtils} other The amount to compare against.
   * @returns {boolean} True if the current value is less than `other`, false otherwise.
   * @example
   * MoneyUtils.of(5).isLessThan(10); // true
   * MoneyUtils.of(10).isLessThan(10); // false
   */
  isLessThan(other: number | string | MoneyUtils): boolean {
    return this._cents < this._toCents(other);
  }

  /**
   * @method isMoreThan
   * @description Checks if the current monetary value is strictly more than another amount.
   * Compares based on the internal cents value.
   * @param {number | string | MoneyUtils} other The amount to compare against.
   * @returns {boolean} True if the current value is more than `other`, false otherwise.
   * @example
   * MoneyUtils.of(15).isMoreThan(10); // true
   * MoneyUtils.of(10).isMoreThan(10); // false
   */
  isMoreThan(other: number | string | MoneyUtils): boolean {
    return this._cents > this._toCents(other);
  }

  /**
   * @property {number} value
   * @description A getter property to retrieve the final monetary value as a decimal number.
   * @returns {number} The current monetary value as a standard decimal number.
   */
  get value(): number {
    return this._cents / 10 ** this._scale;
  }

  /**
   * @property {number} cents
   * @description A getter property to retrieve the internal integer representation (e.g., cents).
   * @returns {number} The current monetary value in its smallest integer unit.
   */
  get cents(): number {
    return this._cents;
  }

  /**
   * @property {string} currency
   * @description A getter property to retrieve the currency code.
   * @returns {string} The currency code (e.g., 'USD').
   */
  get currency(): string {
    return this._currency;
  }

  /**
   * @method valueOf
   * @description Returns the final monetary value as a primitive number.
   * This allows the MoneyUtils object to be treated as a number in certain contexts.
   * @returns {number} The current monetary value as a standard decimal number.
   */
  valueOf(): number {
    return this.value;
  }

  /**
   * @method toString
   * @description Returns the string representation of the final monetary value (unformatted).
   * @returns {string} The string representation of the current monetary value.
   */
  toString(): string {
    return `${this.value.toFixed(this._scale)} ${this._currency}`;
  }
}

// --- Example Usage ---

console.log("--- MoneyUtils Examples ---");

// Basic creation and value retrieval
const price1 = MoneyUtils.of(123.45, "USD");
console.log("Price 1:", price1.value, price1.currency, "cents:", price1.cents); // 123.45 USD cents: 12345

const price2 = MoneyUtils.of("75.89", "EUR");
console.log("Price 2:", price2.value, price2.currency, "cents:", price2.cents); // 75.89 EUR cents: 7589

const price3 = MoneyUtils.of(500, "JPY", 0); // JPY typically has 0 decimal places
console.log("Price 3 (JPY):", price3.value, price3.currency, "cents:", price3.cents); // 500 JPY cents: 500

// Arithmetic operations
const totalCost = MoneyUtils.of(100.5)
  .add(20.75, "5.25") // 100.50 + 20.75 + 5.25 = 126.50
  .subtract(10) // 126.50 - 10 = 116.50
  .multiply(2) // 116.50 * 2 = 233.00
  .divide(4).value; // 233.00 / 4 = 58.25
console.log("Total Cost (chained arithmetic):", totalCost); // Output: 58.25

// Percentage calculations
const itemPrice = MoneyUtils.of(150);
const taxAmount = itemPrice.toPercentage(8).value; // 8% of 150 = 12
console.log("8% of 150:", taxAmount); // Output: 12

const priceWithTax = MoneyUtils.of(150).addPercentage(8).value; // 150 + 8% = 162
console.log("150 + 8% tax:", priceWithTax); // Output: 162

const discountedPrice = MoneyUtils.of(200).subtractPercentage(25).value; // 200 - 25% = 150
console.log("200 - 25% discount:", discountedPrice); // Output: 150

// Formatting
const formattedUSD = MoneyUtils.of(12345.67, "USD").format("en-US");
console.log("Formatted USD (en-US):", formattedUSD); // Output: $12,345.67

const formattedEUR = MoneyUtils.of(9876.54, "EUR").format("de-DE");
console.log("Formatted EUR (de-DE):", formattedEUR); // Output: 9.876,54 €

const formattedGBP = MoneyUtils.of(50.25, "GBP").format("en-GB", { currencyDisplay: "symbol" });
console.log("Formatted GBP (en-GB, symbol):", formattedGBP); // Output: £50.25

const formattedJPY = MoneyUtils.of(1234, "JPY", 0).format("ja-JP");
console.log("Formatted JPY (ja-JP):", formattedJPY); // Output: ¥1,234

// Comparisons
console.log("\n--- MoneyUtils Comparison Examples ---");
const amountA = MoneyUtils.of(100);
const amountB = MoneyUtils.of(100.0);
const amountC = MoneyUtils.of(100.01);
const amountD = MoneyUtils.of(99.99);

console.log("100 isEqual 100.00?", amountA.isEqual(amountB)); // true
console.log("100 isEqual 100.01?", amountA.isEqual(amountC)); // false
console.log("100 isLessThan 100.01?", amountA.isLessThan(amountC)); // true
console.log("100 isMoreThan 99.99?", amountA.isMoreThan(amountD)); // true
console.log("100 isZero?", amountA.isZero()); // false
console.log("0 isZero?", MoneyUtils.of(0).isZero()); // true
console.log("-5 isPositive?", MoneyUtils.of(-5).isPositive()); // false
console.log("-5 isNegative?", MoneyUtils.of(-5).isNegative()); // true

// Chaining with comparisons
const finalAmount = MoneyUtils.of(50).add(25).subtract(10); // 65

console.log("Is finalAmount (65) less than 70?", finalAmount.isLessThan(70)); // true
console.log("Is finalAmount (65) equal to 65?", finalAmount.isEqual(65)); // true
console.log("Is finalAmount (65) positive?", finalAmount.isPositive()); // true

// Handling different scales and currencies in operations (requires careful use or explicit conversion)
// For simplicity, add/subtract/compare assume the same scale as the MoneyUtils instance.
// If you need to add different currencies/scales, you'd convert them first:
const usdAmount = MoneyUtils.of(10, "USD", 2);
const eurAmount = MoneyUtils.of(5, "EUR", 2); // Different currency, same scale

// Directly adding different currencies might not be semantically correct without exchange rates
// console.log(usdAmount.add(eurAmount).value); // This would add 5 EUR as if it were 5 USD cents.
// A more robust solution for multi-currency would involve explicit exchange rate application.
