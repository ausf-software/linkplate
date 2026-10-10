/**
 * @file Log levels.
 *
 * Provides an immutable, ordered set of log levels.
 *
 * @module LogLevel
 */

/**
 * An immutable log level.
 */
export class LogLevel {

  /** @type {LogLevel} */
  static SILENT = new LogLevel('silent', 0, null);

  /** @type {LogLevel} */
  static ERROR = new LogLevel('error',  1, 'error');

  /** @type {LogLevel} */
  static WARN = new LogLevel('warn',   2, 'warn');

  /** @type {LogLevel} */
  static INFO = new LogLevel('info',   3, 'log');

  /** @type {LogLevel} */
  static DEBUG = new LogLevel('debug',  4, 'log');

  /** @type {LogLevel} */
  static TRACE = new LogLevel('trace',  5, 'log');

  /** @type {readonly LogLevel[]} */
  static #values = Object.freeze([
    LogLevel.SILENT, LogLevel.ERROR, LogLevel.WARN,
    LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE,
  ]);

  /** @type {Map<string, LogLevel>} */
  static #byName = new Map(LogLevel.#values.map(l => [l.name, l]));

  #name;
  #severity;
  #consoleMethod;

  /**
   * @param {string} name - Lowercase level name.
   * @param {number} severity - Numeric severity (0 = most severe).
   * @param {string|null} consoleMethod - Console method name, or null to suppress.
   */
  constructor(name, severity, consoleMethod) {
    this.#name = name;
    this.#severity = severity;
    this.#consoleMethod = consoleMethod;
    Object.freeze(this);
  }

  /** @returns {string} Lowercase level name. */
  get name() { return this.#name; }

  /** @returns {number} Numeric severity. */
  get severity() { return this.#severity; }

  /** @returns {string|null} Console method name, or `null`. */
  get consoleMethod() { return this.#consoleMethod; }

  /**
   * Checks whether this level is at least as severe as the given one.
   *
   * @param {LogLevel|string|number} other
   * @returns {boolean}
   */
  isAtLeast(other) {
    return this.#severity >= LogLevel.of(other).severity;
  }

  /**
   * Checks whether this level is at most as severe as the given one.
   *
   * @param {LogLevel|string|number} other
   * @returns {boolean}
   */
  isAtMost(other) {
    return this.#severity <= LogLevel.of(other).severity;
  }

  /** @returns {number} */
  valueOf() { return this.#severity; }

  /** @returns {string} */
  toString() { return this.#name; }

  /** @returns {readonly LogLevel[]} */
  static values() { return LogLevel.#values; }

  /** @returns {string[]} */
  static names() { return LogLevel.#values.map(l => l.name); }

  /**
   * @param {string} name
   * @returns {LogLevel}
   */
  static fromName(name) {
    if (typeof name !== 'string') 
      return LogLevel.DEBUG;
    return LogLevel.#byName.get(name.toLowerCase()) ?? LogLevel.DEBUG;
  }

  /**
   * @param {number} severity
   * @returns {LogLevel}
   */
  static fromSeverity(severity) {
    if (!Number.isFinite(severity))
      return LogLevel.DEBUG;
    const idx = Math.min(Math.max(Math.trunc(severity), 0), LogLevel.#values.length - 1);
    return LogLevel.#values[idx];
  }

  /**
   * Coerces any supported input to a {@link LogLevel}.
   *
   * @param {LogLevel|string|number} value
   * @returns {LogLevel}
   */
  static of(value) {
    if (value instanceof LogLevel)
      return value;
    if (typeof value === 'number')
      return LogLevel.fromSeverity(value);
    if (typeof value === 'string')
      return LogLevel.fromName(value);
    return LogLevel.DEBUG;
  }
}