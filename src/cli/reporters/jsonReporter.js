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

const flush = (state, totalPassed, totalFailed, totalSkipped = 0, totalTodo = 0) => {
  const payload = {
    totals: {passed: totalPassed, failed: totalFailed, skipped: totalSkipped, todo: totalTodo},
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
      state.currentFile = {path: filePath, passed: 0, failed: 0, skipped: 0, todo: 0, tests: []};
      state.files.push(state.currentFile);
    },
    onTestPass: (test) => {
      state.currentFile.tests.push(serializeTest(test, 'passed'));
    },
    onTestFail: (test, error) => {
      state.currentFile.tests.push(serializeTest(test, 'failed', error));
    },
    onTestSkip: (test) => {
      state.currentFile.tests.push(serializeTest(test, 'skipped'));
    },
    onTestTodo: (test) => {
      state.currentFile.tests.push(serializeTest(test, 'todo'));
    },
    onSuiteDone: (passed, failed, skipped, todo) => {
      state.currentFile.passed = passed;
      state.currentFile.failed = failed;
      state.currentFile.skipped = skipped;
      state.currentFile.todo = todo;
      state.currentFile = undefined;
    },
    onNoTestsFound: () => {
      state.noTestsFound = true;
    },
    onRunDone: (totalPassed, totalFailed, totalSkipped, totalTodo) => {
      flush(state, totalPassed, totalFailed, totalSkipped, totalTodo);
    },
    onRunError: (error) => {
      state.error = error;
      flush(state, 0, 0, 0, 0);
    },
  };
};
