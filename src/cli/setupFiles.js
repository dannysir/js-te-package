import {findTestFiles} from "./utils/findFiles.js";
import {collectMockedPaths} from "./utils/collectMocks.js";

export const setupFiles = () => {
  const testFiles = findTestFiles(process.cwd());
  const mockedPaths = collectMockedPaths(testFiles);

  return {mockedPaths, testFiles};
};
