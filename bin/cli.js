#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import {restoreFiles, transformFiles} from "./utils/transformFiles.js";
import {findAllSourceFiles, findTestFiles} from "./utils/findFiles.js";
import {collectMockedPaths} from "../src/mock/collectMocks.js";
import {MODULE_TYPE, NUM, PATH, RESULT_MSG} from "../constants/index.js";
import {getErrorMsgInLogic, getFileCountString, getFilePath, getTestResultMsg} from "./utils/messages.js";

const getUserModuleType = () => {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.type === MODULE_TYPE.MODULE ? MODULE_TYPE.ESM : MODULE_TYPE.CJS;
  } catch {
    return MODULE_TYPE.CJS;
  }
};

const main = async () => {
  try {
    let totalPassed = NUM.ZERO;
    let totalFailed = NUM.ZERO;

    const moduleType = getUserModuleType();

    let jsTe;
    if (moduleType === MODULE_TYPE.ESM) {
      jsTe = await import(PATH.DANNYSIR_JS_TE);
    } else {
      const { createRequire } = await import(MODULE_TYPE.MODULE);
      const require = createRequire(import.meta.url);
      jsTe = require(PATH.DANNYSIR_JS_TE);
    }

    Object.keys(jsTe).forEach(key => {
      global[key] = jsTe[key];
    });

    const testFiles = findTestFiles(process.cwd());
    console.log(getFileCountString(testFiles.length));

    const mockedPaths = collectMockedPaths(testFiles);

    const sourceFiles = findAllSourceFiles(process.cwd());
    for (const file of sourceFiles) {
      transformFiles(file, mockedPaths);
    }

    for (const file of testFiles) {
      console.log(getFilePath(file));
      transformFiles(file, mockedPaths);

      await import(path.resolve(file));

      const {passed, failed} = await jsTe.run();
      totalPassed += passed;
      totalFailed += failed;
    }

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