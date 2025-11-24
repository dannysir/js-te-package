#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {transformSync} from '@babel/core';
import * as jsTe from '../index.js';
import {green, red, yellow} from "../utils/consoleColor.js";
import {getTestResultMsg} from "../utils/makeMessage.js";
import {BABEL, PATH, RESULT_TITLE} from "../constants.js";
import { babelTransformImport } from '../babelTransformImport.js';

let totalPassed = 0;
let totalFailed = 0;
const originalFiles = new Map();

Object.keys(jsTe).forEach(key => {
  global[key] = jsTe[key];
});

const transformFile = (filePath) => {
  const originalCode = fs.readFileSync(filePath, 'utf-8');
  originalFiles.set(filePath, originalCode);

  const transformed = transformSync(originalCode, {
    filename: filePath,
    plugins: [babelTransformImport],
    parserOpts: {
      sourceType: BABEL.MODULE,
      plugins: ['dynamicImport']
    }
  });

  fs.writeFileSync(filePath, transformed.code);
};

const restoreFiles = () => {
  for (const [filePath, originalCode] of originalFiles.entries()) {
    try {
      fs.writeFileSync(filePath, originalCode);
    } catch (error) {
      console.error(red(`Failed to restore ${filePath}: ${error.message}`));
    }
  }
  originalFiles.clear();
};

const findTestFiles = (dir) => {
  const files = [];

  const walk = (directory, inTestDir = false) => {
    const items = fs.readdirSync(directory);
    const dirName = path.basename(directory);

    const isTestDir = dirName === PATH.TEST_DIRECTORY || inTestDir;

    for (const item of items) {
      if (item === PATH.NODE_MODULES) continue;

      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath, isTestDir);
      } else if (item.endsWith(PATH.TEST_FILE) || isTestDir) {
        if (item.endsWith(PATH.JAVASCRIPT_FILE)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

const findAllSourceFiles = (dir) => {
  const files = [];

  const walk = (directory) => {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      if (item === PATH.NODE_MODULES || item === PATH.BIN || item === PATH.TEST_DIRECTORY) continue;

      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith(PATH.JAVASCRIPT_FILE) && !item.endsWith(PATH.TEST_FILE)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}


const main = async () => {
  try {
    const sourceFiles = findAllSourceFiles(process.cwd());
    for (const file of sourceFiles) {
      transformFile(file);
    }

    const testFiles = findTestFiles(process.cwd());

    console.log(`\nFound ${green(testFiles.length)} test file(s)`);

    for (const file of testFiles) {
      console.log(`\n${yellow(file)}\n`);

      transformFile(file);
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