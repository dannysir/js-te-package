import path from 'path';
import {pathToFileURL} from 'node:url';

const narrowToLocationFile = (testFiles, testLocation) => {
  if (testLocation === undefined) return testFiles;
  return testFiles.filter(file => path.resolve(file) === testLocation.file);
};

export const runTests = async (jsTe, mockedPaths, testFiles, reporter, testNamePattern, testLocation) => {
  let totalPassed = 0;
  let totalFailed = 0;

  for (const file of narrowToLocationFile(testFiles, testLocation)) {
    await import(pathToFileURL(path.resolve(file)).href);

    const {passed, failed} = await jsTe.run(reporter, testNamePattern, file, testLocation);
    totalPassed += passed;
    totalFailed += failed;
  }

  return {totalPassed, totalFailed}
};
