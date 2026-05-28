const createState = () => ({
  files: [],
  currentFile: undefined,
  noTestsFound: false,
  error: undefined,
});

const serializeTest = (test, status, error) => {
  const entry = {
    path: test.path,
    description: test.description,
    status,
  };
  if (test.location !== undefined) entry.location = test.location;
  if (error !== undefined) entry.error = {message: error.message};
  return entry;
};

const flush = (state, totalPassed, totalFailed) => {
  const payload = {
    totals: {passed: totalPassed, failed: totalFailed},
    files: state.files,
  };
  if (state.noTestsFound) payload.noTestsFound = true;
  if (state.error !== undefined) payload.error = {message: state.error.message};
  console.log(JSON.stringify(payload));
};

export const createJsonReporter = () => {
  const state = createState();

  return {
    onRunStart: () => {},
    onFileStart: (filePath) => {
      state.currentFile = {path: filePath, passed: 0, failed: 0, tests: []};
      state.files.push(state.currentFile);
    },
    onTestPass: (test) => {
      state.currentFile.tests.push(serializeTest(test, 'passed'));
    },
    onTestFail: (test, error) => {
      state.currentFile.tests.push(serializeTest(test, 'failed', error));
    },
    onSuiteDone: (passed, failed) => {
      state.currentFile.passed = passed;
      state.currentFile.failed = failed;
      state.currentFile = undefined;
    },
    onNoTestsFound: () => {
      state.noTestsFound = true;
    },
    onRunDone: (totalPassed, totalFailed) => {
      flush(state, totalPassed, totalFailed);
    },
    onRunError: (error) => {
      state.error = error;
      flush(state, 0, 0);
    },
  };
};
