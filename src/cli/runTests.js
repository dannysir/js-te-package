import path from 'path';
import {pathToFileURL} from 'node:url';

const narrowToLocationFile = (testFiles, testLocation) => {
  if (testLocation === undefined) return testFiles;
  return testFiles.filter(file => path.resolve(file) === testLocation.file);
};

export const runTests = async (jsTe, mockedPaths, testFiles, reporter, testNamePattern, testLocation) => {
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalTodo = 0;

  for (const file of narrowToLocationFile(testFiles, testLocation)) {
    await import(pathToFileURL(path.resolve(file)).href);

    const {passed, failed, skipped, todo} = await jsTe.run(reporter, testNamePattern, file, testLocation);
    totalPassed += passed;
    totalFailed += failed;
    totalSkipped += skipped;
    totalTodo += todo;
  }

  return {totalPassed, totalFailed, totalSkipped, totalTodo}
};
