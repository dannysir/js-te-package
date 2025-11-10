export const getErrorMsg = (expect, actual) => {
  return `Expected ${JSON.stringify(expect)} but got ${JSON.stringify(actual)}`;
};

export const getTestResultMsg = (success, fail) => {
  return `\nTests: ${success} passed, ${fail} failed, ${success + fail} total`;
};

export const RUNNING_TEST_MSG = 'Running tests...\n';

export const CHECK = '✓ ';

export const CROSS = '✗ ';

export const DIRECTORY_DELIMITER = ' > ';

export const EMPTY = '';

export const DEFAULT_COUNT = 0;
