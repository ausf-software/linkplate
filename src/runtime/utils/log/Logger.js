/**
 * @file Namespaced console logger.
 *
 * @module Logger
 */

import { LogLevel } from './LogLevel.js';
import { formatPrefix, buildStyleArgs } from '../format/LogFormatter.js';

/**
 * @typedef {import('./LogManager.js').LogManager} LogManager
 */

/**
 * Logger bound to a single namespace.
 */
export class Logger {

  /** @type {LogManager} */
  #gate;

  /** @type {string} */
  #namespace;

  /** @type {string} */
  #color;

  /**
   * @param {LogManager} gate - Log manager controlling activity and formatting.
   * @param {string} namespace - Namespace name.
   * @param {string} color - Namespace color.
   */
  constructor(gate, namespace, color) {
    this.#gate = gate;
    this.#namespace = String(namespace || 'app');
    this.#color = color;
  }

  /** @returns {string} */
  getNamespace() { return this.#namespace; }

  /**
   * @param {LogLevel} [level=LogLevel.TRACE]
   * @returns {boolean}
   */
  isActive(level = LogLevel.TRACE) {
    return this.#gate.isActive(this.#namespace, LogLevel.of(level));
  }

  /**
   * Formats arguments with namespace prefix and color.
   * @param {*[]} args
   * @returns {*[]}
   */
  #formatArgs(args) {
    const colorize = this.#gate.isColorize();
    return [
      formatPrefix(this.#namespace, colorize),
      ...buildStyleArgs(this.#color, colorize),
      ...args
    ];
  }

  /**
   * Emits a log entry if the level is active.
   * @param {LogLevel} level
   * @param {*[]} args
   * @returns {void}
   */
  #emit(level, args) {
    if (!this.#gate.isActive(this.#namespace, level)) return;

    const method = level.consoleMethod;
    if (!method) return;

    /** @type {(...data: any[]) => void} */
    const fn = console[method];
    fn(...this.#formatArgs(args));
  }

  /** @param {...*} args @returns {void} */
  error(...args) { this.#emit(LogLevel.ERROR, args); }

  /** @param {...*} args @returns {void} */
  warn(...args) { this.#emit(LogLevel.WARN,  args); }

  /** @param {...*} args @returns {void} */
  info(...args) { this.#emit(LogLevel.INFO,  args); }

  /** @param {...*} args @returns {void} */
  debug(...args) { this.#emit(LogLevel.DEBUG, args); }

  /** @param {...*} args @returns {void} */
  trace(...args) { this.#emit(LogLevel.TRACE, args); }

  /** @param {string} label @returns {void} */
  group(label) { this.#openGroup('group', label); }

  /** @param {string} label @returns {void} */
  groupCollapsed(label) { this.#openGroup('groupCollapsed', label); }

  /**
   * @param {'group'|'groupCollapsed'} method
   * @param {string} label
   * @returns {void}
   */
  #openGroup(method, label) {
    if (!this.#gate.isActive(this.#namespace, LogLevel.DEBUG))
      return;
    console[method](...this.#formatArgs([label]));
  }

  /** @returns {void} */
  groupEnd() {
    if (!this.#gate.isActive(this.#namespace, LogLevel.DEBUG))
      return;
    console.groupEnd();
  }

  /**
   * @param {*} data
   * @param {string[]} [columns]
   * @returns {void}
   */
  table(data, columns) {
    if (!this.#gate.isActive(this.#namespace, LogLevel.DEBUG)) return;
    console.log(...this.#formatArgs([]));
    console.table(data, columns);
  }

  /** @param {string} label @returns {void} */
  time(label) {
    if (!this.#gate.isActive(this.#namespace, LogLevel.TRACE))
      return;
    console.time(`${this.#namespace}:${label}`);
  }

  /** @param {string} label @returns {void} */
  timeEnd(label) {
    if (!this.#gate.isActive(this.#namespace, LogLevel.TRACE))
      return;
    console.timeEnd(`${this.#namespace}:${label}`);
  }

  /**
   * Times a function and logs the elapsed time.
   * @template T
   * @param {string} label - Label for the timing output.
   * @param {() => T} fn - Function to execute.
   * @returns {T} Function result.
   */
  timeIt(label, fn) {
    if (!this.#gate.isActive(this.#namespace, LogLevel.TRACE))
      return fn();

    const start = performance.now();
    try {
      return fn();
    } finally {
      const ms = (performance.now() - start).toFixed(2);
      console.log(...this.#formatArgs([`${label}: ${ms}ms`]));
    }
  }
}