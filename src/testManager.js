import {DEFAULT_COUNT, DIRECTORY_DELIMITER, RESULT_TITLE} from "../constants.js";
import {formatFailureMessage, formatSuccessMessage} from "../utils/formatString.js";
import {clearAllMocks} from "./mock/store.js";
import {getTestResultMsg} from "../utils/makeMessage.js";

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
      path: this.#testDepth.join(DIRECTORY_DELIMITER),
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

  #formatDescription(args, description) {
    let argIndex = 0;
    return description.replace(/%([so])/g, (match, type) => {
      if (argIndex >= args.length) return match;

      const arg = args[argIndex++];

      switch (type) {
        case 's':
          return arg;
        case 'o':
          return JSON.stringify(arg);
        default:
          return match;
      }
    });
  }
}

export const testManager = new TestManager();