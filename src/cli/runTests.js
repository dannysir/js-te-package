import path from 'path';
import {pathToFileURL} from 'node:url';
import {getFilePath} from "./utils/messages.js";
import {NUM} from "../constants/index.js";

export const runTests = async (jsTe, mockedPaths, testFiles) => {
  let totalPassed = NUM.ZERO;
  let totalFailed = NUM.ZERO;

  for (const file of testFiles) {
    console.log(getFilePath(file));

    await import(pathToFileURL(path.resolve(file)).href);

    const {passed, failed} = await jsTe.run();
    totalPassed += passed;
    totalFailed += failed;
  }

  return {totalPassed, totalFailed}
};
