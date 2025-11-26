import {CHECK, CROSS, DIRECTORY_DELIMITER, EMPTY} from "../constants.js";
import {green, red} from "./consoleColor.js";

export const formatSuccessMessage = (test) => {
  const pathString = test.path === '' ? EMPTY : test.path + DIRECTORY_DELIMITER;
  return green(CHECK) + pathString + test.description;
};

export const formatFailureMessage = (test, error) => {
  const messages = [];
  messages.push(red(CROSS) + test.path + test.description);
  messages.push(red(`  Error Message : ${error.message}`));
  return messages.join('\n');
};

export const getErrorMsg = (expect, actual) => {
  return `Expected ${JSON.stringify(expect)} but got ${JSON.stringify(actual)}`;
};
export const getThrowErrorMsg = (expect) => {
  return `Expected function to throw an error containing "${expect}", but it did not throw`;
};