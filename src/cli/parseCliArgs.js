import {parseArgs} from "node:util";
import path from "node:path";

const HELP_TEXT = `Usage: js-te [options] [file patterns...]

Run tests. With no arguments, runs every test file.
File patterns filter test files by case-sensitive substring match against the file path
(multiple patterns are OR-ed). The name pattern filters by case-sensitive substring match
against the full test name ("describe > ... > test description").

Options:
  -t, --testNamePattern <pattern>  Only run tests whose full name includes <pattern>
      --testLocation <path:line>   Run only the test defined at <path> on <line>
  -h, --help                       Show this help

Examples:
  js-te                            Run all tests
  js-te user                       Run test files whose path includes "user"
  js-te user payment               Files matching "user" OR "payment"
  js-te -t "login"                 Run tests whose full name includes "login"
  js-te auth -t "token"            Combine file filter and name filter
  js-te --testLocation test/user.test.js:42   Run the test on line 42 of that file

Exit codes:
  0  All tests passed
  1  One or more tests failed, or no tests matched the filter
`;

export const printHelp = () => {
  process.stdout.write(HELP_TEXT);
};

export const parseTestLocation = (value) => {
  const separatorIndex = value.lastIndexOf(":");
  if (separatorIndex === -1) {
    throw new Error(`testLocation must be in "<path>:<line>" form, got "${value}"`);
  }

  const filePart = value.slice(0, separatorIndex);
  const line = Number(value.slice(separatorIndex + 1));

  if (filePart === "" || !Number.isInteger(line) || line <= 0) {
    throw new Error(`testLocation must be in "<path>:<line>" form with a positive line number, got "${value}"`);
  }

  return {file: path.resolve(process.cwd(), filePart), line};
};

export const parseCliArgs = (argv) => {
  try {
    const {values, positionals} = parseArgs({
      args: argv,
      options: {
        testNamePattern: {type: "string", short: "t"},
        testLocation: {type: "string"},
        help: {type: "boolean", short: "h"},
      },
      allowPositionals: true,
      strict: true,
    });

    return {
      filePatterns: positionals,
      testNamePattern: values.testNamePattern,
      testLocation: values.testLocation === undefined ? undefined : parseTestLocation(values.testLocation),
      help: values.help === true,
    };
  } catch (error) {
    throw new Error(`Invalid CLI arguments: ${error.message}`);
  }
};
