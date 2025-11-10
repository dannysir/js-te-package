#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {run} from "../index.js";

function findTestFiles(dir) {
  const files = [];

  function walk(directory, inTestDir = false) {
    const items = fs.readdirSync(directory);
    const dirName = path.basename(directory);

    const isTestDir = dirName === 'test' || inTestDir;

    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath, isTestDir);
      } else if (item.endsWith('.test.js') || isTestDir) {
        if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

const testFiles = findTestFiles(process.cwd());

console.log(`Found ${testFiles.length} test file(s)\n`);

for (const file of testFiles) {
  await import(path.resolve(file));
}

run();