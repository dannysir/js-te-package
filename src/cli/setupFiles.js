import {findTestFiles} from "./utils/findFiles.js";
import {filterTestFiles} from "./utils/filterTestFiles.js";
import {collectMockedPaths} from "./utils/collectMocks.js";

export const setupFiles = ({filePatterns = []} = {}) => {
  const allTestFiles = findTestFiles(process.cwd());
  const testFiles = filterTestFiles(allTestFiles, filePatterns);
  const mockedPaths = collectMockedPaths(testFiles);

  return {mockedPaths, testFiles, totalFileCount: allTestFiles.length};
};
