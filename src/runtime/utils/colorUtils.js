/**
 * @file Color utility functions.
 *
 * Provides small, dependency-free helpers for converting between color
 * representations.
 *
 * @module ColorUtils
 */

/**
 * HSL → RGB → hex.
 *
 * @param {number} h hue, 0..359
 * @param {number} s saturation, 0..1
 * @param {number} l lightness, 0..1
 * @returns {string} '#rrggbb'
 */
export function hslToHex(h, s, l) {
  const c  = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x  = c * (1 - Math.abs((hp % 2) - 1));

  let r1 = 0, g1 = 0, b1 = 0;

  if (hp < 1) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (hp < 2) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (hp < 3) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (hp < 4) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (hp < 5) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
    b1 = x;
  }

  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  /** @type {(n: number) => string} */
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}