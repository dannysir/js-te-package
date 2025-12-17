import {bold, green, red, yellow} from "../../utils/consoleColor.js";

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

export const getFileCountString = (n) => {
  return `\nFound ${green(n)} test file(s)`;
};

export const getFilePath = (path) => {
  return `\n${yellow(path)}\n`;
};

export const getErrorMsgInLogic = (error) => {
  return red(`\n✗ Test execution failed\n  Error: ${error}\n`)
};