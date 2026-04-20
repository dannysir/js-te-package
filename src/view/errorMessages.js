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

export const formatContainErrorMsg = (expected, actual) => {
  return `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`;
};

export const formatInstanceOfErrorMsg = (Ctor, actual) => {
  const name = Ctor?.name || 'Constructor';
  const actualName = actual === null ? 'null'
    : actual === undefined ? 'undefined'
    : actual?.constructor?.name ?? typeof actual;
  return `Expected value to be instance of ${name} but got ${actualName}`;
};

export const formatCalledErrorMsg = (callCount) => {
  return `Expected mock to have been called, but it was called ${callCount} times`;
};

export const formatCalledWithErrorMsg = (expectedArgs, calls) => {
  return `Expected mock to have been called with ${JSON.stringify(expectedArgs)}, but received calls: ${JSON.stringify(calls)}`;
};

export const formatCalledTimesErrorMsg = (expected, actual) => {
  return `Expected mock to have been called ${expected} times, but it was called ${actual} times`;
};
