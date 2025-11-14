import {bold, green, red} from "./consoleColor.js";

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