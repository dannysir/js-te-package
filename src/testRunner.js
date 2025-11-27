import {DEFAULT_COUNT, RESULT_TITLE} from "../constants.js";
import {testManager} from "./testManager.js";
import {formatFailureMessage, formatSuccessMessage} from "../utils/formatString.js";
import {getTestResultMsg} from "../utils/makeMessage.js";
import {clearAllMocks} from "./mock/store.js";

export const run = async () => {
  let passed = DEFAULT_COUNT;
  let failed = DEFAULT_COUNT;

  for (const test of testManager.getTests()) {
    try {
      await test.fn();
      console.log(formatSuccessMessage(test));
      passed++;
      clearAllMocks();
    } catch (error) {
      console.log(formatFailureMessage(test, error));
      failed++;
    }
  }

  console.log(getTestResultMsg(RESULT_TITLE.TESTS, passed, failed));

  testManager.clearTests();

  return {passed, failed};
}