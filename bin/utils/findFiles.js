import fs from 'fs';
import path from 'path';
import {PATH} from "../../constants.js";

export const findTestFiles = (dir) => {
  const files = [];

  const walk = (directory, inTestDir = false) => {
    const items = fs.readdirSync(directory);
    const dirName = path.basename(directory);

    const isTestDir = dirName === PATH.TEST_DIRECTORY || inTestDir;

    for (const item of items) {
      if (item === PATH.NODE_MODULES) continue;

      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath, isTestDir);
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

export const findAllSourceFiles = (dir) => {
  const files = [];

  const walk = (directory) => {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      if (item === PATH.NODE_MODULES || item === PATH.BIN || item === PATH.TEST_DIRECTORY || item === PATH.DIST) continue;

      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith(PATH.JAVASCRIPT_FILE) && !item.endsWith(PATH.TEST_FILE)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}