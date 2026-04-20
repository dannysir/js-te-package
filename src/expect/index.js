import {matchers} from "./matchers/index.js";

const buildExpectApi = (matcherMap, actual, isNot) => Object.fromEntries(
  Object.entries(matcherMap).map(([name, matcher]) => [name, (...args) => {
    const {pass, message} = matcher(actual, ...args);
    if (pass === isNot) {
      throw new Error(message());
    }
  }])
);

export const expect = (actual) => {
  const api = buildExpectApi(matchers, actual, false);
  api.not = buildExpectApi(matchers, actual, true);
  return api;
};
