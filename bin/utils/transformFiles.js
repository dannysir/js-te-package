import fs from 'fs';
import {transformSync} from "@babel/core";
import {babelTransformImport} from "../../babelTransformImport.js";
import {BABEL} from "../../constants.js";
import {red} from "../../utils/consoleColor.js";

const originalFiles = new Map();

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
  console.log(transformed.code);
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