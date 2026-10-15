/**
 * @file String utility functions.
 *
 * Provides small, dependency-free helpers for working with strings.
 *
 * @module StringUtils
 */

/**
 * 32-bit signed hash of a string.
 *
 * @param {string} s
 * @returns {number} signed 32-bit integer
 */
export function hashString(s) {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 3) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}