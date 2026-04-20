import path from 'path';
import {pathToFileURL} from 'node:url';
import {getFilePath} from "../view/testMessages.js";

export const runTests = async (jsTe, mockedPaths, testFiles) => {
  let totalPassed = 0;
  let totalFailed = 0;

  for (const file of testFiles) {
    console.log(getFilePath(file));

    await import(pathToFileURL(path.resolve(file)).href);

    const {passed, failed} = await jsTe.run();
    totalPassed += passed;
    totalFailed += failed;
  }

  return {totalPassed, totalFailed}
};
