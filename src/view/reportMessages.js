import {bold, green, red, yellow} from "./colors.js";

export const RESULT_MSG = {
  TESTS: 'Tests: ',
  TOTAL: 'Total Result: ',
  CHECK: '✓ ',
  CROSS: '✗ ',
  DIRECTORY_DELIMITER: ' > ',
  EMPTY: '',
};

export const formatSuccessMessage = (test) => {
  const pathString = test.path === '' ? RESULT_MSG.EMPTY : test.path + RESULT_MSG.DIRECTORY_DELIMITER;
  return green(RESULT_MSG.CHECK) + pathString + test.description;
};

export const formatFailureMessage = (test, error) => {
  const messages = [];
  messages.push(red(RESULT_MSG.CROSS) + test.path + test.description);
  messages.push(red(`  Error Message : ${error.message}`));
  return messages.join('\n');
};

export const getTestResultMsg = (title, success, fail) => {
  let msg = '\n';

  msg += title;
  msg += green(success + ' passed') + ', ';
  if (fail) {
    msg += red(fail + ' failed') + ', ';
  }
  msg += bold(success + fail + ' total');

  return msg;
};

export const getFileCountString = (totalCount, matchedCount = totalCount) => {
  if (matchedCount === totalCount) return `\nFound ${green(totalCount)} test file(s)`;
  return `\nFound ${green(totalCount)} test file(s), ${green(matchedCount)} matched filter`;
};

export const getFilterSummaryMsg = (testNamePattern) => {
  return `\nFilter applied: -t "${testNamePattern}"`;
};

export const getNoTestsFoundMsg = (filePatterns, testNamePattern) => {
  const parts = [];
  if (filePatterns?.length) parts.push(`file pattern(s) [${filePatterns.join(', ')}]`);
  if (testNamePattern !== undefined) parts.push(`name pattern "${testNamePattern}"`);
  const suffix = parts.length ? ` matching ${parts.join(' and ')}` : '';
  return yellow(`\n⚠ No tests found${suffix}`);
};

export const getFilePath = (path) => {
  return `\n${yellow(path)}\n`;
};

export const getErrorMsgInLogic = (error) => {
  return red(`\n✗ Test execution failed\n  Error: ${error}\n`);
};
