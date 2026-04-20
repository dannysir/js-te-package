export const formatErrorMsg = (expect, actual) => {
  return `Expected ${JSON.stringify(expect)} but got ${JSON.stringify(actual)}`;
};

const describeThrowExpected = (expected) => {
  if (expected === undefined) {
    return 'to throw an error';
  }
  if (typeof expected === 'string') {
    return `to throw an error containing "${expected}"`;
  }
  if (expected instanceof RegExp) {
    return `to throw an error matching ${expected}`;
  }
  if (typeof expected === 'function') {
    if (expected === Error || expected.prototype instanceof Error) {
      return `to throw an instance of ${expected.name || 'Error'}`;
    }
    return 'to throw an error matching predicate';
  }
  return 'to throw an error';
};

export const formatThrowErrorMsg = (expected, thrown) => {
  const head = `Expected function ${describeThrowExpected(expected)}`;
  if (thrown === undefined) {
    return `${head}, but it did not throw`;
  }
  const actual = thrown instanceof Error
    ? `${thrown.constructor.name}: ${thrown.message}`
    : String(thrown);
  return `${head}, but got ${actual}`;
};
