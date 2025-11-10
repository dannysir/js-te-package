import {
  CHECK,
  CROSS, DEFAULT_COUNT,
  DIRECTORY_DELIMITER,
  EMPTY,
  getErrorMsg,
  getTestResultMsg,
  RUNNING_TEST_MSG
} from "./constants.js";

const tests = [];
let currentDescribe = null;

export function test(description, fn) {
  tests.push({ description, fn, suite: currentDescribe });
}

export function describe(suiteName, fn) {
  const previousDescribe = currentDescribe;
  currentDescribe = suiteName;
  fn();
  currentDescribe = previousDescribe;
}

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

  for (const test of tests) {
    try {
      await test.fn();
      console.log(`${CHECK}${test.suite ? test.suite + DIRECTORY_DELIMITER : EMPTY}${test.description}`);
      passed++;
    } catch (error) {
      console.log(`${CROSS}${test.suite ? test.suite + DIRECTORY_DELIMITER : EMPTY}${test.description}`);
      console.log(`  ${error.message}\n`);
      failed++;
    }
  }

  console.log(getTestResultMsg(passed, failed));

  if (failed > DEFAULT_COUNT) {
    process.exit(1);
  }
}