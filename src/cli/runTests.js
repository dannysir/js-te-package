import path from 'path';
import {pathToFileURL} from 'node:url';

export const runTests = async (jsTe, mockedPaths, testFiles, reporter) => {
  let totalPassed = 0;
  let totalFailed = 0;

  for (const file of testFiles) {
    reporter.onFileStart(file);

    await import(pathToFileURL(path.resolve(file)).href);

    const {passed, failed} = await jsTe.run(reporter);
    totalPassed += passed;
    totalFailed += failed;
  }

  return {totalPassed, totalFailed}
};
