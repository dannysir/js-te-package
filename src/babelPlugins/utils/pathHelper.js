import path from 'path';

import {BABEL} from "../../constants/babel.js";

/**
 * 상대/절대 경로를 절대 경로로 변환
 * @param {string} source - import/require 경로
 * @param {string} currentFilePath - 현재 파일의 경로
 * @returns {string} 절대 경로
 *
 * @example
 * // 상대 경로인 경우:
 * resolveAbsolutePath('./random.js', '/Users/san/project/test.js')
 * // 반환: '/Users/san/project/random.js'
 *
 * // 절대 경로인 경우:
 * resolveAbsolutePath('/Users/san/lib/utils.js', '/Users/san/project/test.js')
 * // 반환: '/Users/san/lib/utils.js'
 */
export const findAbsolutePath = (source, currentFilePath) => {
  const currentDir = path.dirname(currentFilePath || process.cwd());

  if (source.startsWith(BABEL.PERIOD)) {
    return path.resolve(currentDir, source);
  }

  return source;
};

/**
 * 해당 경로가 변환 대상인지 확인
 * @param {string} absolutePath - 절대 경로
 * @param {Set<string>|null} mockedPaths - mock된 경로들
 * @returns {boolean}
 *
 * @example
 * // mockedPaths가 null인 경우:
 * shouldTransform('/Users/san/project/random.js', null)
 * // 반환: true (모든 파일 변환)
 *
 * // mockedPaths에 포함된 경우:
 * const mocked = new Set(['/Users/san/project/random.js']);
 * shouldTransform('/Users/san/project/random.js', mocked)
 * // 반환: true (변환 대상)
 *
 * // mockedPaths에 없는 경우:
 * shouldTransform('/Users/san/project/game.js', mocked)
 * // 반환: false (변환하지 않음)
 */
export const shouldTransform = (absolutePath, mockedPaths) => {
  if (!mockedPaths) {
    return true;
  }

  return mockedPaths.has(absolutePath);
};
