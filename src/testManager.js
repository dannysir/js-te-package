import {formatFailureMessage, formatSuccessMessage, getMatcherForReplace, placeHolder} from "./utils/formatString.js";
import {clearAllMocks} from "./mock/store.js";
import {NUM, RESULT_MSG} from "../constants/index.js";
import {getTestResultMsg} from "../bin/utils/messages.js";

class TestManager {
  #tests = [];
  #testDepth = [];
  #beforeEachArr = [];

  describe(str, fn) {
    this.#testDepth.push(str);
    const prevLength = this.#beforeEachArr.length;
    fn();
    this.#beforeEachArr.length = prevLength;
    this.#testDepth.pop();
  }

  test(description, fn) {
    const beforeEachHooks = [...this.#beforeEachArr];

    const testObj = {
      description,
      fn: async () => {
        for (const hook of beforeEachHooks) {
          await hook();
        }
        await fn();
      },
      path: this.#testDepth.join(RESULT_MSG.DIRECTORY_DELIMITER),
    }
    this.#tests.push(testObj);
  }

  testEach(cases) {
    return (description, fn) => {
      cases.forEach(testCase => {
        const args = Array.isArray(testCase) ? testCase : [testCase];
        this.test(this.#formatDescription(args, description), () => fn(...args));
      });
    };
  }

  beforeEach(fn) {
    this.#beforeEachArr.push(fn);
  }

  getTests() {
    return [...this.#tests];
  }

  clearTests() {
    this.#tests = [];
    this.#testDepth = [];
    this.#beforeEachArr = [];
  }

  async run() {
    let passed = NUM.ZERO;
    let failed = NUM.ZERO;

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

    console.log(getTestResultMsg(RESULT_MSG.TESTS, passed, failed));

    testManager.clearTests();

    return {passed, failed};
  }

  #formatDescription(args, description) {
    let argIndex = 0;
    return description.replace(getMatcherForReplace(), (match, type) => {
      if (argIndex >= args.length) return match;

      const formatter = placeHolder[type];

      return formatter ? formatter(args[argIndex++]) : match;
    });
  }
}

export const testManager = new TestManager();