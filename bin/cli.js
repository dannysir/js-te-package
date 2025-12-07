#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import {restoreFiles, transformFiles} from "./utils/transformFiles.js";
import {findAllSourceFiles, findTestFiles} from "./utils/findFiles.js";
import {green, red, yellow} from "../utils/consoleColor.js";
import {getTestResultMsg} from "../utils/makeMessage.js";
import {RESULT_TITLE} from "../constants.js";
import {collectMockedPaths} from "../src/mock/collectMocks.js";

const getUserModuleType = () => {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.type === 'module' ? 'esm' : 'cjs';
  } catch {
    return 'cjs';
  }
};

const main = async () => {
  try {
    let totalPassed = 0;
    let totalFailed = 0;

    const moduleType = getUserModuleType();

    let jsTe;
    if (moduleType === 'esm') {
      jsTe = await import('@dannysir/js-te');
    } else {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      jsTe = require('@dannysir/js-te');
    }

    Object.keys(jsTe).forEach(key => {
      global[key] = jsTe[key];
    });

    const testFiles = findTestFiles(process.cwd());
    console.log(`\nFound ${green(testFiles.length)} test file(s)`);

    const mockedPaths = collectMockedPaths(testFiles);

    const sourceFiles = findAllSourceFiles(process.cwd());
    for (const file of sourceFiles) {
      transformFiles(file, mockedPaths);
    }

    for (const file of testFiles) {
      console.log(`\n${yellow(file)}\n`);

      await import(path.resolve(file));

      const {passed, failed} = await jsTe.run();
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