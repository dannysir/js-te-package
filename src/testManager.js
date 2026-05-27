import {fileURLToPath} from "node:url";
import {RESULT_MSG} from "./view/reportMessages.js";
import {clearAllMocks} from "./mock/store.js";

const NOOP_REPORTER = {
  onTestPass: () => {},
  onTestFail: () => {},
  onSuiteDone: () => {},
};

const SELF_FILE = fileURLToPath(import.meta.url);

const parseStackFrame = (frame) => {
  const trimmed = frame.trim();
  const inParen = trimmed.match(/\(([^()]+)\)$/);
  const location = inParen ? inParen[1] : trimmed.replace(/^at\s+/, '');

  const match = location.match(/^(.*):(\d+):(\d+)$/);
  if (!match) return undefined;

  const rawFile = match[1];
  if (rawFile.startsWith('node:')) return undefined;

  const file = rawFile.startsWith('file://') ? fileURLToPath(rawFile) : rawFile;
  return {file, line: Number(match[2])};
};

const captureCallSite = () => {
  const stack = new Error().stack;
  if (!stack) return undefined;

  for (const frame of stack.split('\n').slice(1)) {
    const parsed = parseStackFrame(frame);
    if (parsed === undefined) continue;
    if (parsed.file === SELF_FILE) continue;
    return parsed;
  }
  return undefined;
};

const getFullName = (test) =>
  test.path === ''
    ? test.description
    : test.path + RESULT_MSG.DIRECTORY_DELIMITER + test.description;

export const filterTestsByName = (tests, pattern) => {
  if (pattern === undefined) return tests;
  return tests.filter(test => getFullName(test).includes(pattern));
};

export const filterTestsByLocation = (tests, location) => {
  if (location === undefined) return tests;
  return tests.filter(test =>
    test.location !== undefined &&
    test.location.file === location.file &&
    test.location.line === location.line
  );
};

class TestManager {
  #tests = [];
  #testDepth = [];
  #beforeEachArr = [];
  #placeHolder = {
    's': (value) => value,
    'o': (value) => JSON.stringify(value),
  };

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
      location: captureCallSite(),
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

  getMatchingTests(testNamePattern, testLocation) {
    const byName = filterTestsByName(this.getTests(), testNamePattern);
    return filterTestsByLocation(byName, testLocation);
  }

  async run(reporter = NOOP_REPORTER, testNamePattern, file, testLocation) {
    const tests = this.getMatchingTests(testNamePattern, testLocation);

    if (tests.length === 0) {
      this.clearTests();
      return {passed: 0, failed: 0};
    }

    if (file !== undefined) reporter.onFileStart(file);

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        await test.fn();
        reporter.onTestPass(test);
        passed++;
        clearAllMocks();
      } catch (error) {
        reporter.onTestFail(test, error);
        failed++;
      }
    }

    reporter.onSuiteDone(passed, failed);

    this.clearTests();

    return {passed, failed};
  }

  #getMatcherForReplace = () => {
    return new RegExp(`%([${Object.keys(this.#placeHolder).join('')}])`, 'g')
  };

  #formatDescription(args, description) {
    let argIndex = 0;
    return description.replace(this.#getMatcherForReplace(), (match, type) => {
      if (argIndex >= args.length) return match;

      const formatter = this.#placeHolder[type];

      return formatter ? formatter(args[argIndex++]) : match;
    });
  }
}

export const testManager = new TestManager();
