/**
 * @file Logger factory: a single entry point through which the
 * application obtains {@link Logger} instances.
 *
 * @module LoggerFactory
 */

import { Logger } from './Logger.js';
import { Palette, hslToHex } from '../colorUtils.js';
import { hashString } from '../stringUtils.js';

/**
 * Produces {@link Logger} instances.
 */
export class LoggerFactory {

  /** @type {import('./LogManager.js').LogManager|null} */
  static #gate = null;

  /** @type {Palette<string, string>|null} */
  static #palette = null;

  /**
   * Wires the factory to the application's {@link LogManager} and
   * prepares the shared palette. Call once during bootstrap, before any
   * logger is requested.
   *
   * @param {import('./LogManager.js').LogManager} gate
   * @returns {void}
   */
  static configure(gate) {
    LoggerFactory.#gate = gate;
    LoggerFactory.#palette = LoggerFactory.#createLogPalette();
  }

  /**
   * Lets callers fail early with a clear message instead of hitting an
   * opaque error on the first log call.
   *
   * @returns {boolean}
   */
  static isConfigured() {
    return LoggerFactory.#gate !== null;
  }

  /**
   * Hands out a logger bound to the given namespace.
   *
   * @param {string} namespace
   * @returns {Logger}
   * @throws {Error} If the factory has not been configured yet.
   */
  static getLogger(namespace) {
    if (LoggerFactory.#gate === null || LoggerFactory.#palette === null) {
      throw new Error(
        'LoggerFactory is not configured. ' +
        'Call AppContext.getInstance() during application bootstrap.'
      );
    }
    const ns = String(namespace || 'app');
    const color = LoggerFactory.#palette.colorFor(ns);
    return new Logger(LoggerFactory.#gate, ns, color);
  }

  /**
   * Makes the same namespace recognizable at a glance while keeping
   * different namespaces distinguishable
   *
   * @param {{ saturation?: number, lightness?: number }} [opts]
   * @returns {Palette<string, string>}
   */
  static #createLogPalette({ saturation = 0.70, lightness = 0.45 } = {}) {
    return new Palette((namespace) => {
      const hue = Math.abs(hashString(String(namespace))) % 360;
      return hslToHex(hue, saturation, lightness);
    });
  }
}