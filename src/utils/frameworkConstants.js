/**
 * @file Global framework constants.
 *
 * Provides an immutable collection of framework-wide constants used across
 * the project.
 *
 * @module FrameworkConstants
 */

/**
 * The framework name.
 *
 * @type {string}
 */
const NAME = 'LinkPlate';

/**
 * Immutable collection of framework-wide constants.
 *
 * The object is frozen via `Object.freeze`, so its properties cannot be
 * reassigned, added, or removed at runtime.
 *
 * @property {string} NAME - The framework name.
 * @property {string} STORAGE_PREFIX - Prefix used for all storage keys
 *   managed by the framework.
 */
export const FrameworkConstants = Object.freeze({
  NAME,
  STORAGE_PREFIX: NAME + ':',
});