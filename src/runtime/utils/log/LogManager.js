/**
 * @file Log manager: decides whether a log entry should be displayed
 * at all, and - if so - whether a given log level is allowed for
 * a given namespace.
 *
 * @module LogManager
 */

import { LogLevel } from './LogLevel.js';
import { FrameworkConstants } from '../frameworkConstants.js';
import { formatPrefix } from '../format/LogFormatter.js';
import { serializeConfig, applyConfig } from '../serialization/LogConfigCodec.js';
import { LocalStorageManager } from '../storage/LocalStorageManager.js';

/**
 * Central log manager. Owns the runtime configuration and acts as the
 * single source of truth for the {@link Logger} instances.
 */
export class LogManager {

  /** @type {import('./LogConfig.js').LogConfig} */
  #config;

  /** @type {LocalStorageManager|null} */
  #storage;

  /**
   * @param {import('./LogConfig.js').LogConfig} config
   */
  constructor(config) {
    if (!config)
      throw new Error('LogManager: config is required');
    this.#config = config;
    this.#storage = null;
  }

  /**
   * Attaches a storage backend, restores the config from it and then
   * applies any URL-parameter overrides. On URL overrides the merged
   * state is persisted back to storage.
   *
   * @param {LocalStorageManager} storage
   * @returns {void}
   */
  attachStorage(storage) {
    this.#storage = storage;
    this.#restoreFromStorage();
    if (this.#applyUrlParams()) {
      this.#persistToStorage();
    }
  }

  /**
   * @param {string} ns
   * @returns {boolean}
   */
  isNamespaceEnabled(ns) {
    return this.#config.hasNamespace(ns);
  }

  /**
   * @param {LogLevel|string|number} level
   * @returns {boolean}
   */
  isLevelEnabled(level) {
    return LogLevel.of(level).isAtMost(this.#config.level);
  }

  /**
   * @param {string} ns
   * @param {LogLevel|string|number} level
   * @returns {boolean}
   */
  isActive(ns, level) {
    return this.isNamespaceEnabled(ns) && this.isLevelEnabled(level);
  }

  /** @returns {boolean} */
  isColorize() { return this.#config.colorize; }

  /**
   * Emits an internal warning through the console. Used only for
   * diagnostics coming from the manager itself.
   *
   * @param {string} msg - Warning message.
   * @param {*} [err] - Optional error or additional payload.
   * @returns {void}
   */
  #warn(msg, err) {
    console.warn(
      formatPrefix('utils/log/LogManager', false),
      msg,
      ...(err !== undefined ? [err] : [])
    );
  }

  /**
   * Writes the current configuration to the attached storage backend,
   * if persistence is enabled.
   *
   * @returns {void}
   */
  #persistToStorage() {
    if (!this.#storage || !this.#config.persist)
      return;
    const ok = this.#storage.set(
      this.#config.storageKey,
      serializeConfig(this.#config)
    );
    if (!ok)
      this.#warn('failed to persist debug configuration');
  }

  /**
   * Restores the configuration from the attached storage backend.
   * Missing or invalid entries are ignored by {@link applyConfig}.
   *
   * @returns {void}
   */
  #restoreFromStorage() {
    if (!this.#storage)
      return;
    const plain = this.#storage.get(this.#config.storageKey, null);
    applyConfig(this.#config, plain);
  }

  /**
   * Removes the persisted configuration from the attached storage backend.
   *
   * @returns {void}
   */
  clearStorage() {
    if (!this.#storage)
      return;
    this.#storage.remove(this.#config.storageKey);
  }

  /**
   * Reads <FRAMEWORK_NAME>_level, <FRAMEWORK_NAME>_debug,
   * <FRAMEWORK_NAME>_trace from the URL.
   *
   * @returns {boolean} true if any parameter was applied.
   */
  #applyUrlParams() {
    if (typeof location === 'undefined')
      return false;

    const params = new URLSearchParams(location.search);
    let touched = false;

    const levelParam = params.get(`${FrameworkConstants.NAME}_level`);
    if (levelParam) {
      this.#config.level = LogLevel.of(levelParam);
      touched = true;
    }

    const debugParam = params.get(`${FrameworkConstants.NAME}_debug`);
    if (debugParam !== null) {
      touched = true;
      this.#applyDebugParam(debugParam);
    }

    const traceParam = params.get(`${FrameworkConstants.NAME}_trace`);
    if (traceParam === '1' || traceParam === 'true') {
      touched = true;
      this.#config.enabled = true;
      this.#config.namespaces = ['*'];
      if (!levelParam) this.#config.level = LogLevel.TRACE;
    }

    return touched;
  }

  /**
   * Applies the debug URL parameter.
   *
   * Supported values:
   *  - 0 | off | false — disables logging entirely.
   *  - 1 | on | true | "" — enables logging for all namespaces.
   *  - any other string — treated as a comma-separated namespace list.
   *
   * @param {string} value - Raw parameter value.
   * @returns {void}
   */
  #applyDebugParam(value) {
    if (value === '0' || value === 'off' || value === 'false') {
      this.#config.enabled = false;
      return;
    }
    if (value === '1' || value === 'on' || value === 'true' || value === '') {
      this.#config.enabled = true;
      this.#config.namespaces = ['*'];
      return;
    }
    this.#config.enabled = true;
    this.#config.namespaces = value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  /**
   * Updates one or more configuration fields at once and persists the
   * result. Unspecified or invalid fields are left untouched.
   *
   * @param {{
   *   enabled?: boolean,
   *   level?: LogLevel|string|number,
   *   namespaces?: string[],
   *   persist?: boolean,
   *   colorize?: boolean
   * }} [opts] - Partial configuration object.
   * @returns {void}
   */
  configure(opts = {}) {
    if (typeof opts.enabled === 'boolean')
      this.#config.enabled = opts.enabled;
    if (opts.level != null)
      this.#config.level = LogLevel.of(opts.level);
    if (Array.isArray(opts.namespaces) && opts.namespaces.length)
      this.#config.namespaces = opts.namespaces;
    if (typeof opts.persist === 'boolean') 
      this.#config.persist = opts.persist;
    if (typeof opts.colorize === 'boolean')
      this.#config.colorize = opts.colorize;
    this.#persistToStorage();
  }

  /**
   * Enables logging for the given namespaces (or all if none given).
   *
   * @param {...string} namespaces
   * @returns {void}
   */
  enable(...namespaces) {
    this.#config.enabled = true;
    this.#config.namespaces = namespaces.length ? namespaces : ['*'];
    this.#persistToStorage();
  }

  /**
   * Disables logging entirely. Namespace set and level are preserved.
   *
   * @returns {void}
   */
  disable() {
    this.#config.enabled = false;
    this.#persistToStorage();
  }

  /**
   * Sets the minimum log level. Messages below this level are ignored.
   *
   * @param {LogLevel|string|number} level
   * @returns {void}
   */
  setLevel(level) {
    this.#config.level = LogLevel.of(level);
    this.#persistToStorage();
  }

  /**
   * Replaces the allowed-namespace set.
   *
   * @param {string[]} list - Non-empty list of namespaces; an empty
   *   array resets the set to ['*'].
   * @returns {void}
   */
  setNamespaces(list) {
    this.#config.namespaces = list;
    this.#persistToStorage();
  }

  /**
   * Returns a plain, serialisable snapshot of the current configuration.
   *
   * @returns {{
   *   enabled: boolean,
   *   level: string,
   *   namespaces: string[],
   *   persist: boolean,
   *   colorize: boolean
   * }}
   */
  getState() {
    return {
      enabled:    this.#config.enabled,
      level:      this.#config.level.name,
      namespaces: Array.from(this.#config.namespaces),
      persist:    this.#config.persist,
      colorize:   this.#config.colorize
    };
  }

  /**
   * Resets the configuration to defaults and clears any persisted state.
   *
   * @returns {void}
   */
  reset() {
    this.#config.reset();
    this.clearStorage();
  }
}