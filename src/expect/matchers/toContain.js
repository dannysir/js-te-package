import {formatContainErrorMsg} from "../../view/errorMessages.js";

export const toContain = (actual, expected) => {
  const supports = (Array.isArray(actual) || typeof actual === 'string')
    && typeof actual.includes === 'function';
  return {
    pass: supports && actual.includes(expected),
    message: () => formatContainErrorMsg(expected, actual),
  };
};
