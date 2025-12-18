import fs from 'fs';
import {transformSync} from "@babel/core";
import {createMockCollectorPlugin} from "../babelPlugins/babelCollectMocks.js";
import {BABEL} from "../constants/babel.js";

export const collectMockedPaths = (testFiles) => {
  const mockedPaths = new Set();

  for (const testFile of testFiles) {
    const code = fs.readFileSync(testFile, 'utf-8');

    try {
      transformSync(code, {
        filename: testFile,
        plugins: [createMockCollectorPlugin(mockedPaths)],
        parserOpts: {
          sourceType: BABEL.MODULE,
          plugins: ['dynamicImport']
        }
      });
    } catch (error) {
      console.warn(`Warning: Failed to scan ${testFile} for mocks`);
    }
  }

  return mockedPaths;
};