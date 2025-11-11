import {
  CHECK,
  CROSS, DEFAULT_COUNT, DIRECTORY_DELIMITER, EMPTY,
  getErrorMsg,
  getTestResultMsg,
  RUNNING_TEST_MSG
} from "./constants.js";
import {Tests} from "./src/tests.js";

const tests = new Tests();

export const test = (description, fn) => tests.test(description, fn);

export const describe = (suiteName, fn) => tests.describe(suiteName, fn);

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(getErrorMsg(expected, actual));
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(getErrorMsg(expected, actual));
      }
    }
  };
}

export async function run() {
  let passed = DEFAULT_COUNT;
  let failed = DEFAULT_COUNT;

  console.log(RUNNING_TEST_MSG);

  for (const test of tests.getTests()) {
    try {
      await test.fn();
      console.log(CHECK + (test.path === '' ? EMPTY : test.path + DIRECTORY_DELIMITER) + test.description);
      passed++;
    } catch (error) {
      console.log(CROSS + test.path + test.description);
      console.log(`  ${error.message}\n`);
      failed++;
    }
  }

  console.log(getTestResultMsg(passed, failed));

  if (failed > DEFAULT_COUNT) {
    process.exit(1);
  }
}