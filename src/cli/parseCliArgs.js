import {parseArgs} from "node:util";

const HELP_TEXT = `Usage: js-te [options] [file patterns...]

Options:
  -t, --testNamePattern <pattern>  Only run tests whose full name includes <pattern>
  -h, --help                       Show this help

Examples:
  js-te                            Run all tests
  js-te user                       Run test files whose path includes "user"
  js-te -t "login"                 Run tests whose full name includes "login"
  js-te auth -t "token"            Combine file filter and name filter
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
