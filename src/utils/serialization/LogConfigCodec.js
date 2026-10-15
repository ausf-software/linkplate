/**
 * @file Serialization codec for logging configuration.
 *
 * Converts {@link LogConfig} to/from a plain object.
 *
 * @module LogConfigCodec
 */

/** @typedef {import('../log/LogConfig.js').LogConfig} LogConfig */

/**
 * Serializes a {@link LogConfig} into a plain object.
 *
 * @param {LogConfig} config - Configuration to serialize.
 * @returns {{enabled: boolean, level: string, namespaces: string[]}}
 */
export function serializeConfig(config) {
  return {
    enabled:    config.enabled,
    level:      config.level.name,
    namespaces: Array.from(config.namespaces)
  };
}

/**
 * Applies a plain object (from storage) onto a {@link LogConfig}.
 *
 * Missing or malformed fields are ignored - the config keeps its
 * current value for anything that fails validation. Invalid plain
 * input is a no-op.
 *
 * @param {LogConfig} config - Target configuration to mutate.
 * @param {*} plain - Previously serialized data; ignored if not an object.
 * @returns {void}
 */
export function applyConfig(config, plain) {
  if (!plain || typeof plain !== 'object') return;

  if (typeof plain.enabled === 'boolean')
    config.enabled = plain.enabled;
  if (plain.level)
    config.level = plain.level;
  if (Array.isArray(plain.namespaces) && plain.namespaces.length) {
    config.namespaces = plain.namespaces.map(String);
  }
}