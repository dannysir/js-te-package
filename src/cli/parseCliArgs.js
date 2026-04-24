import {parseArgs} from "node:util";

const HELP_TEXT = `Usage: js-te [options] [file patterns...]

Run tests. With no arguments, runs every test file.
File patterns filter test files by case-sensitive substring match against the file path
(multiple patterns are OR-ed). The name pattern filters by case-sensitive substring match
against the full test name ("describe > ... > test description").

Options:
  -t, --testNamePattern <pattern>  Only run tests whose full name includes <pattern>
  -h, --help                       Show this help

Examples:
  js-te                            Run all tests
  js-te user                       Run test files whose path includes "user"
  js-te user payment               Files matching "user" OR "payment"
  js-te -t "login"                 Run tests whose full name includes "login"
  js-te auth -t "token"            Combine file filter and name filter

Exit codes:
  0  All tests passed
  1  One or more tests failed, or no tests matched the filter
`;

export const printHelp = () => {
  process.stdout.write(HELP_TEXT);
};

export const parseCliArgs = (argv) => {
  try {
    const {values, positionals} = parseArgs({
      args: argv,
      options: {
        testNamePattern: {type: "string", short: "t"},
        help: {type: "boolean", short: "h"},
      },
      allowPositionals: true,
      strict: true,
    });

    return {
      filePatterns: positionals,
      testNamePattern: values.testNamePattern,
      help: values.help === true,
    };
  } catch (error) {
    throw new Error(`Invalid CLI arguments: ${error.message}`);
  }
};
