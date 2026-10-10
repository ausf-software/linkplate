/**
 * @file Logging configuration.
 *
 * Holds user-facing logger settings: whether logging is enabled, the
 * minimum level, the set of allowed namespaces, and the persistence and
 * colorization flags.
 *
 * @module LogConfig
 */

import { LogLevel } from './LogLevel.js';
import { FrameworkConstants } from '../frameworkConstants.js';

/**
 * Logging settings with safe defaults.
 */
export class LogConfig {

  /** @type {boolean} */
  static DEFAULT_ENABLED = true;

  /** @type {LogLevel} */
  static DEFAULT_LEVEL = LogLevel.DEBUG;
  
  /** @type {readonly string[]} */
  static DEFAULT_NAMESPACES = Object.freeze(['*']);
  
  /** @type {boolean} */
  static DEFAULT_PERSIST = true;
  
  /** @type {boolean} */
  static DEFAULT_COLORIZE = true;
  
  /** @type {string} */
  static STORAGE_KEY = FrameworkConstants.STORAGE_PREFIX + 'log_config';

  /** @type {boolean} */
  #enabled;

  /** @type {LogLevel} */
  #level;

  /** @type {Set<string>} */
  #namespaces;

  /** @type {boolean} */
  #persist;

  /** @type {boolean} */
  #colorize;

  constructor() {
    this.#enabled = LogConfig.DEFAULT_ENABLED;
    this.#level = LogConfig.DEFAULT_LEVEL;
    this.#namespaces = new Set(LogConfig.DEFAULT_NAMESPACES);
    this.#persist = LogConfig.DEFAULT_PERSIST;
    this.#colorize = LogConfig.DEFAULT_COLORIZE;
  }

  /**
   * Resets all settings back to their default values.
   *
   * @returns {void}
   */
  reset() {
    this.#enabled = LogConfig.DEFAULT_ENABLED;
    this.#level = LogConfig.DEFAULT_LEVEL;
    this.#namespaces = new Set(LogConfig.DEFAULT_NAMESPACES);
    this.#persist = LogConfig.DEFAULT_PERSIST;
    this.#colorize = LogConfig.DEFAULT_COLORIZE;
  }

  /** @returns {boolean} */
  get enabled() { return this.#enabled; }

  /** @param {*} flag */
  set enabled(flag) { this.#enabled = Boolean(flag); }

  /** @returns {LogLevel} */
  get level() { return this.#level; }
  
  /** @param {LogLevel|string|number} level */
  set level(level) { this.#level = LogLevel.of(level); }

  /**
   * Returns a copy of the namespace set.
   *
   * @returns {Set<string>}
   */
  get namespaces() { return new Set(this.#namespaces); }

  /**
   * @param {string[]} list - Non-empty array of names; an empty or invalid
   *   list is reset to `['*']`.
   */
  set namespaces(list) {
    if (!Array.isArray(list) || list.length === 0) {
      this.#namespaces = new Set(['*']);
    } else {
      this.#namespaces = new Set(list.map(String));
    }
  }

  /** @returns {boolean} */
  get persist() { return this.#persist; }
  
  /** @param {*} flag */
  set persist(flag) { this.#persist = Boolean(flag); }

  /** @returns {boolean} */
  get colorize() { return this.#colorize; }
  
  /** @param {*} flag */
  set colorize(flag) { this.#colorize = Boolean(flag); }

  /** @returns {string} Storage key under which the configuration is saved. */
  get storageKey() { return LogConfig.STORAGE_KEY; }

  /**
   * Checks whether logging is allowed for the given namespace.
   *
   * Returns false if logging is disabled entirely. The '*' symbol in
   * the namespace set means "allow everything".
   *
   * @param {string} ns - Namespace to check.
   * @returns {boolean}
   */
  hasNamespace(ns) {
    if (!this.#enabled) 
      return false;
    if (this.#namespaces.has('*'))
      return true;
    return this.#namespaces.has(ns);
  }
}