/**
 * @file Log formatting utilities.
 * 
 * @module LogFormatter
 */

import { FrameworkConstants } from '../frameworkConstants.js';

/**
 * Formats the log prefix string.
 *
 * @param {string} ns - The namespace identifier.
 * @param {boolean} colorize - Whether to add '%c' placeholders for CSS styling.
 * @returns {string} The formatted prefix.
 */
export function formatPrefix(ns, colorize) {
  const tag = `[${FrameworkConstants.NAME}/${ns}]`;
  return colorize ? `%c${tag}%c` : tag;
}

/**
 * Builds the CSS style arguments corresponding to the '%c' placeholders
 * in the prefix.
 *
 * @param {string} color - The CSS color string for the namespace.
 * @param {boolean} colorize - Whether to generate style arguments.
 * @returns {string[]} If colorize is false, returns an empty array.
 *   If true, returns an array of two CSS style strings:
 *   1. color:<color>;font-weight:bold - applies the given color and bold font.
 *   2. color:inherit - resets the color for the rest of the log message.
 */
export function buildStyleArgs(color, colorize) {
  if (!colorize) return [];
  return [
    `color:${color};font-weight:bold`,
    'color:inherit'
  ];
}

/**
 * Builds a namespace string from a sequence of path segments.
 *
 * @param {...string} segments - Path parts describing the source module.
 * @returns {string} Normalized namespace, e.g. "utils/MyUtils".
 * @throws {TypeError} If any segment is not a string.
 */
export function nsFrom(...segments) {
  if (segments.length === 0) return '';

  const parts = [];
  for (const seg of segments) {
    if (typeof seg !== 'string') {
      throw new TypeError('nsFrom: every segment must be a string');
    }
    for (const piece of seg.split('/')) {
      const cleaned = piece.replace(/^\/+|\/+$/g, '');
      if (cleaned) parts.push(cleaned);
    }
  }

  if (parts.length === 0) return '';

  const last = parts.length - 1;
  parts[last] = parts[last].replace(/\.(m?js|ts|jsx|tsx)$/, '');
  if (parts[last] === 'index' && parts.length > 1) parts.pop();

  return parts.join('/');
}