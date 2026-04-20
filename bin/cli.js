#!/usr/bin/env node

import {getErrorMsgInLogic, getFileCountString, getTestResultMsg, RESULT_MSG} from "../src/view/testMessages.js";
import {setupEnvironment} from "../src/cli/setupEnvironment.js";
import {setupFiles} from "../src/cli/setupFiles.js";
import {runTests} from "../src/cli/runTests.js";
import {installLoaderHook} from "../src/cli/loaderHook.js";

const main = async () => {
  try {
    const jsTe = await setupEnvironment();
    const {mockedPaths, testFiles} = setupFiles();

    installLoaderHook(mockedPaths);

    console.log(getFileCountString(testFiles.length));
    const {totalPassed, totalFailed} = await runTests(jsTe, mockedPaths, testFiles);
    console.log(getTestResultMsg(RESULT_MSG.TOTAL, totalPassed, totalFailed));

    return totalFailed > 0 ? 1 : 0;
  } catch (error) {
    console.log(getErrorMsgInLogic(error.message));
    return 1;
  }
};

const exitCode = await main();
process.exit(exitCode);
