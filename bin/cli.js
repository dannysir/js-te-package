#!/usr/bin/env node

import path from 'path';
import * as jsTe from '../index.js';
import {restoreFiles, transformFiles} from "./utils/transformFiles.js";
import {findAllSourceFiles, findTestFiles} from "./utils/findFiles.js";
import {green, red, yellow} from "../utils/consoleColor.js";
import {getTestResultMsg} from "../utils/makeMessage.js";
import {RESULT_TITLE} from "../constants.js";
import {run} from "../src/testRunner.js";

const main = async () => {
  try {
    let totalPassed = 0;
    let totalFailed = 0;

    Object.keys(jsTe).forEach(key => {
      global[key] = jsTe[key];
    });

    const sourceFiles = findAllSourceFiles(process.cwd());
    for (const file of sourceFiles) {
      transformFiles(file);
    }

    const testFiles = findTestFiles(process.cwd());

    console.log(`\nFound ${green(testFiles.length)} test file(s)`);

    for (const file of testFiles) {
      console.log(`\n${yellow(file)}\n`);

      transformFiles(file);
      await import(path.resolve(file));

      const {passed, failed} = await run();
      totalPassed += passed;
      totalFailed += failed;
    }

    console.log(getTestResultMsg(RESULT_TITLE.TOTAL, totalPassed, totalFailed));

    return totalFailed > 0 ? 1 : 0;

  } catch (error) {
    console.log(red('\n✗ Test execution failed'));
    console.log(red(`  Error: ${error.message}\n`));
    return 1;
  } finally {
    restoreFiles();
  }
};

const exitCode = await main();
process.exit(exitCode);