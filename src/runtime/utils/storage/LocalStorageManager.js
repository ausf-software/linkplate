/**
 * @file Local storage manager.
 *
 * Provides namespaced wrapper around "window.localStorage".
 *
 * @module LocalStorageManager
 */

import { FrameworkConstants } from '../frameworkConstants.js';

/** @typedef {import('../log/Logger.js').Logger} Logger */

/**
 * Manages framework-specific values in "window.localStorage".
 *
 * All keys are automatically prefixed. If "localStorage" is 
 * unavailable, the manager falls back to a no-op mode.
 */
export class LocalStorageManager {
  /**
   * @type {Logger}
   */
  #logger;

  /**
   * @type {Storage|null}
   */
  #storage;

  /**
   * @type {boolean}
   */
  #available;

  /**
   * Creates a new local storage manager.
   *
   * @param {Logger} logger - Logger used for diagnostics.
   * @throws {Error} If logger is not provided.
   */
  constructor(logger) {
    if (!logger) {
      throw new Error('LocalStorageManager: logger is required');
    }
    this.#logger    = logger;
    this.#storage   = this.#detectStorage();
    this.#available = this.#storage !== null;

    if (this.#available) {
      this.#logger.debug('localStorage is available');
    } else {
      this.#logger.debug('localStorage is not available; persistence is disabled');
    }
  }

  /**
   * Detects whether "localStorage" is available and writable.
   *
   * @private
   * @returns {Storage|null} The storage instance, or null if unavailable.
   */
  #detectStorage() {
    if (typeof window === 'undefined') return null;
    try {
      const store = window.localStorage;
      if (!store) return null;
      const probe = '__lp_probe__';
      store.setItem(probe, '1');
      store.removeItem(probe);
      return store;
    } catch {
      return null;
    }
  }

  /**
   * Builds the full storage key by applying the framework prefix.
   *
   * @private
   * @param {string} key - User key.
   * @returns {string} Prefixed storage key.
   */
  #storageKey(key) {
    return `${FrameworkConstants.STORAGE_PREFIX}${key}`;
  }

  /**
   * Checks whether local storage is available.
   *
   * @returns {boolean} true if storage can be used; otherwise false.
   */
  isAvailable() { return this.#available; }

  /**
   * Reads and deserializes a value from local storage.
   *
   * @param {string} key - User key.
   * @param {*} [fallback=null] - Value returned if the key is missing,
   *   storage is unavailable, or stored data is invalid JSON.
   * @returns {*} Deserialized value, or fallback.
   */
  get(key, fallback = null) {
    if (!this.#available) return fallback;

    let raw;
    try {
      raw = this.#storage.getItem(this.#storageKey(key));
    } catch (err) {
      this.#logger.warn(`failed to read key "${key}":`, err);
      return fallback;
    }

    if (raw === null || raw === undefined) return fallback;

    try {
      return JSON.parse(raw);
    } catch (err) {
      this.#logger.warn(`key "${key}" is not valid JSON; returning fallback:`, err);
      return fallback;
    }
  }

  /**
   * Serializes and writes a value to local storage.
   *
   * @param {string} key - User key.
   * @param {*} value - Value to serialize and store.
   * @returns {boolean} true if the value was written; otherwise false.
   */
  set(key, value) {
    if (!this.#available) return false;

    let serialized;
    try {
      serialized = JSON.stringify(value);
    } catch (err) {
      this.#logger.warn(`failed to serialize value for key "${key}":`, err);
      return false;
    }

    try {
      this.#storage.setItem(this.#storageKey(key), serialized);
      return true;
    } catch (err) {
      this.#logger.warn(`failed to write key "${key}":`, err);
      return false;
    }
  }

  /**
   * Removes a value from local storage.
   *
   * @param {string} key - User key.
   * @returns {boolean} true if the key was removed; otherwise false.
   */
  remove(key) {
    if (!this.#available) return false;
    try {
      this.#storage.removeItem(this.#storageKey(key));
      return true;
    } catch (err) {
      this.#logger.warn(`failed to remove key "${key}":`, err);
      return false;
    }
  }

  /**
   * Checks whether a key exists in local storage.
   *
   * @param {string} key - User key.
   * @returns {boolean} true if the key exists; otherwise false.
   */
  has(key) {
    if (!this.#available) return false;
    try {
      return this.#storage.getItem(this.#storageKey(key)) !== null;
    } catch (err) {
      this.#logger.warn(`failed to probe key "${key}":`, err);
      return false;
    }
  }

  /**
   * Returns all framework-managed keys without the storage prefix.
   *
   * @returns {string[]} Array of unprefixed framework keys.
   */
  keys() {
    if (!this.#available) return [];

    const prefix = FrameworkConstants.STORAGE_PREFIX;
    const result = [];
    try {
      for (let i = 0; i < this.#storage.length; i++) {
        const k = this.#storage.key(i);
        if (k !== null && k.startsWith(prefix)) {
          result.push(k.slice(prefix.length));
        }
      }
      return result;
    } catch (err) {
      this.#logger.warn('failed to list keys:', err);
      return [];
    }
  }

  /**
   * Removes all framework-managed keys from local storage.
   * Only keys with the framework storage prefix are removed.
   *
   * @returns {boolean} true if the operation completed; otherwise false.
   */
  clear() {
    if (!this.#available) return false;

    const prefix = FrameworkConstants.STORAGE_PREFIX;
    try {
      const toRemove = [];
      for (let i = 0; i < this.#storage.length; i++) {
        const k = this.#storage.key(i);
        if (k !== null && k.startsWith(prefix)) {
          toRemove.push(k);
        }
      }
      for (const k of toRemove) {
        this.#storage.removeItem(k);
      }
      return true;
    } catch (err) {
      this.#logger.warn('failed to clear framework keys:', err);
      return false;
    }
  }
}