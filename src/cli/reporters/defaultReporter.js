import {
  formatFailureMessage,
  formatSuccessMessage,
  getErrorMsgInLogic,
  getFileCountString,
  getFilePath,
  getFilterSummaryMsg,
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
  onSuiteDone: (passed, failed) => {
    console.log(getTestResultMsg(RESULT_MSG.TESTS, passed, failed));
  },
  onRunDone: (totalPassed, totalFailed) => {
    console.log(getTestResultMsg(RESULT_MSG.TOTAL, totalPassed, totalFailed));
  },
  onRunError: (error) => {
    console.log(getErrorMsgInLogic(error.message));
  },
};
