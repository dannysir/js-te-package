import fs from 'fs';
import {transformSync} from "@babel/core";
import {babelTransformImport} from "../../babelPlugins/babelTransformImport.js";
import {BABEL} from "../../constants.js";
import {red} from "../../utils/consoleColor.js";

const originalFiles = new Map();

/**
 * 파일의 import/require문을 변경하는 함수입니다.
 * @param {string} filePath - 파일 절대 경로
 * @param {Set} mockPath - 모킹한 파일 저장소
 */
export const transformFiles = (filePath, mockPath) => {
  const originalCode = fs.readFileSync(filePath, 'utf-8');
  originalFiles.set(filePath, originalCode);

  const transformed = transformSync(originalCode, {
    filename: filePath,
    plugins: [babelTransformImport(mockPath)],
    parserOpts: {
      sourceType: BABEL.MODULE,
      plugins: ['dynamicImport']
    }
  });

  fs.writeFileSync(filePath, transformed.code);
};

export const restoreFiles = () => {
  for (const [filePath, originalCode] of originalFiles.entries()) {
    try {
      fs.writeFileSync(filePath, originalCode);
    } catch (error) {
      console.error(red(`Failed to restore ${filePath}: ${error.message}`));
    }
  }
  originalFiles.clear();
};