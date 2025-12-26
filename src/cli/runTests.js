import path from 'path';
import {getFilePath} from "./utils/messages.js";
import {transformFiles} from "./utils/transformFiles.js";
import {NUM} from "../constants/index.js";

export const runTests = async (jsTe, mockedPaths, testFiles) => {
  let totalPassed = NUM.ZERO;
  let totalFailed = NUM.ZERO;

  for (const file of testFiles) {
    console.log(getFilePath(file));
    transformFiles(file, mockedPaths);

    await import(path.resolve(file));

    const {passed, failed} = await jsTe.run();
    totalPassed += passed;
    totalFailed += failed;
  }

  return {totalPassed, totalFailed}
};
