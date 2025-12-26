#!/usr/bin/env node

import {NUM, RESULT_MSG} from "../src/constants/index.js";
import {restoreFiles} from "../src/cli/utils/transformFiles.js";
import {getErrorMsgInLogic, getFileCountString, getTestResultMsg} from "../src/cli/utils/messages.js";
import {setupEnvironment} from "../src/cli/setupEnvironment.js";
import {setupFiles} from "../src/cli/setupFiles.js";
import {runTests} from "../src/cli/runTests.js";

const main = async () => {
  try {
    const jsTe = await setupEnvironment();
    const {mockedPaths, testFiles} = setupFiles();

    console.log(getFileCountString(testFiles.length));
    const {totalPassed, totalFailed} = await runTests(jsTe, mockedPaths, testFiles);
    console.log(getTestResultMsg(RESULT_MSG.TOTAL, totalPassed, totalFailed));

    return totalFailed > NUM.ZERO ? NUM.ONE : NUM.ZERO;
  } catch (error) {
    console.log(getErrorMsgInLogic(error.message));
    return NUM.ONE;
  } finally {
    restoreFiles();
  }
};

const exitCode = await main();
process.exit(exitCode);
