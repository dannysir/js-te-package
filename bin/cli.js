#!/usr/bin/env node

import {parseCliArgs, printHelp} from "../src/cli/parseCliArgs.js";
import {setupEnvironment} from "../src/cli/setupEnvironment.js";
import {setupFiles} from "../src/cli/setupFiles.js";
import {runTests} from "../src/cli/runTests.js";
import {installLoaderHook} from "../src/cli/loaderHook.js";
import {defaultReporter} from "../src/cli/reporters/defaultReporter.js";

let cliOptions;
try {
  cliOptions = parseCliArgs(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (cliOptions.help) {
  printHelp();
  process.exit(0);
}

const main = async () => {
  const reporter = defaultReporter;
  try {
    const jsTe = await setupEnvironment();
    const {mockedPaths, testFiles} = setupFiles();

    installLoaderHook(mockedPaths);

    reporter.onRunStart(testFiles.length);
    const {totalPassed, totalFailed} = await runTests(jsTe, mockedPaths, testFiles, reporter);
    reporter.onRunDone(totalPassed, totalFailed);

    return totalFailed > 0 ? 1 : 0;
  } catch (error) {
    reporter.onRunError(error);
    return 1;
  }
};

const exitCode = await main();
process.exit(exitCode);
