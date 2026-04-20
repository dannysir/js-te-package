export const runArgFnc = (actual) => {
  if (typeof actual === 'function') {
    return actual();
  }
  return actual;
};
