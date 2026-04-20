import fs from 'fs';
import path from 'path';


import {PATH} from "../../constants/index.js";

/**
 * 테스트 파일을 찾는 로직입니다.
 * @param {string} dir
 * @returns {string[]}
 */
export const findTestFiles = (dir) => {
  const files = [];

  const walk = (directory) => {
    const items = fs.readdirSync(directory);
    const dirName = path.basename(directory);
    const isTestDir = dirName === PATH.TEST_DIRECTORY;

    for (const item of items) {
      if (item === PATH.NODE_MODULES) continue;

      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith(PATH.TEST_FILE) || isTestDir) {
        if (item.endsWith(PATH.JAVASCRIPT_FILE)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}
