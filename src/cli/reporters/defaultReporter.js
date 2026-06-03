import {
  formatFailureMessage,
  formatSkippedMessage,
  formatSuccessMessage,
  formatTodoMessage,
  getErrorMsgInLogic,
  getFileCountString,
  getFilePath,
  getFilterSummaryMsg,
  getNoTestsFoundMsg,
  getTestResultMsg,
  RESULT_MSG,
} from "../../view/reportMessages.js";

export const defaultReporter = {
  onRunStart: (totalCount, matchedCount, testNamePattern) => {
    console.log(getFileCountString(totalCount, matchedCount));
    if (testNamePattern !== undefined) {
      console.log(getFilterSummaryMsg(testNamePattern));
    }
  },
  onFileStart: (filePath) => {
    console.log(getFilePath(filePath));
  },
  onTestPass: (test) => {
    console.log(formatSuccessMessage(test));
  },
  onTestFail: (test, error) => {
    console.log(formatFailureMessage(test, error));
  },
  onTestSkip: (test) => {
    console.log(formatSkippedMessage(test));
  },
  onTestTodo: (test) => {
    console.log(formatTodoMessage(test));
  },
  onSuiteDone: (passed, failed, skipped, todo) => {
    console.log(getTestResultMsg(RESULT_MSG.TESTS, passed, failed, skipped, todo));
  },
  onNoTestsFound: (filePatterns, testNamePattern) => {
    console.log(getNoTestsFoundMsg(filePatterns, testNamePattern));
  },
  onRunDone: (totalPassed, totalFailed, totalSkipped, totalTodo) => {
    console.log(getTestResultMsg(RESULT_MSG.TOTAL, totalPassed, totalFailed, totalSkipped, totalTodo));
  },
  onRunError: (error) => {
    console.log(getErrorMsgInLogic(error.message));
  },
};
