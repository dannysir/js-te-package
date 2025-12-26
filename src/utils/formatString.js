import {green, red} from "./consoleColor.js";
import {RESULT_MSG} from "../constants/index.js";

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

export const formatErrorMsg = (expect, actual) => {
  return `Expected ${JSON.stringify(expect)} but got ${JSON.stringify(actual)}`;
};

export const formatThrowErrorMsg = (expect) => {
  return `Expected function to throw an error containing "${expect}", but it did not throw`;
};
