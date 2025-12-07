import fs from 'fs';
import {transformSync} from "@babel/core";
import {BABEL} from "../../constants.js";
import {createMockCollectorPlugin} from "../../babelCollectMocks.js";

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
      // 파싱 에러는 무시 (어차피 테스트 실행 시 에러 발생)
      console.warn(`Warning: Failed to scan ${testFile} for mocks`);
    }
  }

  return mockedPaths;
};