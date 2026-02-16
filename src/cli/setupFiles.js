import {findAllSourceFiles, findTestFiles} from "./utils/findFiles.js";
import {collectMockedPaths} from "./utils/collectMocks.js";
import {transformFiles} from "./utils/transformFiles.js";

export const setupFiles = () => {
  const testFiles = findTestFiles(process.cwd());
  const sourceFiles = findAllSourceFiles(process.cwd());
  const mockedPaths = collectMockedPaths(testFiles);

  for (const file of sourceFiles) {
    transformFiles(file, mockedPaths);
  }
  return {mockedPaths, testFiles}
};
