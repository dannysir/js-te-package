import {findAllSourceFiles, findTestFiles} from "./utils/findFiles.js";
import {collectMockedPaths} from "../mock/collectMocks.js";
import {transformFiles} from "./utils/transformFiles.js";

export const setupFiles = () => {
  const testFiles = findTestFiles(process.cwd());
  const mockedPaths = collectMockedPaths(testFiles);
  const sourceFiles = findAllSourceFiles(process.cwd());

  for (const file of sourceFiles) {
    transformFiles(file, mockedPaths);
  }
  return {mockedPaths, testFiles}
};
