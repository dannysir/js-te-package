#!/usr/bin/env node

import {parseCliArgs, printHelp} from "../src/cli/parseCliArgs.js";
import {setupEnvironment} from "../src/cli/setupEnvironment.js";
import {setupFiles} from "../src/cli/setupFiles.js";
import {runTests} from "../src/cli/runTests.js";
import {installLoaderHook} from "../src/cli/loaderHook.js";
import {defaultReporter} from "../src/cli/reporters/defaultReporter.js";
import {createJsonReporter} from "../src/cli/reporters/jsonReporter.js";

const pickReporter = (name) => {
  if (name === 'json') return createJsonReporter();
  return defaultReporter;
};

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
  const reporter = pickReporter(cliOptions.reporter);
  try {
    const jsTe = await setupEnvironment();
    const {mockedPaths, testFiles, totalFileCount} = setupFiles({filePatterns: cliOptions.filePatterns});

    installLoaderHook(mockedPaths);

    reporter.onRunStart(totalFileCount, testFiles.length, cliOptions.testNamePattern);
    const {totalPassed, totalFailed, totalSkipped, totalTodo} = await runTests(jsTe, mockedPaths, testFiles, reporter, cliOptions.testNamePattern, cliOptions.testLocation);

    const zeroMatched = totalPassed + totalFailed + totalSkipped + totalTodo === 0;
    if (zeroMatched) reporter.onNoTestsFound(cliOptions.filePatterns, cliOptions.testNamePattern);
    reporter.onRunDone(totalPassed, totalFailed, totalSkipped, totalTodo);

    return (totalFailed > 0 || zeroMatched) ? 1 : 0;
  } catch (error) {
    reporter.onRunError(error);
    return 1;
  }
};

const exitCode = await main();
process.exit(exitCode);
