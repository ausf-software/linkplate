// TODO: реализовать

export class LogManager {

  /**
   * активен ли уровень логгирования для указанного пространства
   *
   * @param {string} namespace
   * @param {import('./LogLevel.js').LogLevel} level
   * @returns {boolean}
   */
  isActive(namespace, level) {}

  /**
   * включена ли сейчас раскраска вывода
   *
   * @returns {boolean}
   */
  isColorize() {}
}