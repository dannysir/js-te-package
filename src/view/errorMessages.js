export const formatErrorMsg = (expect, actual) => {
  return `Expected ${JSON.stringify(expect)} but got ${JSON.stringify(actual)}`;
};

export const formatThrowErrorMsg = (expect) => {
  return `Expected function to throw an error containing "${expect}", but it did not throw`;
};
