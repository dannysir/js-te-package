import {mockStore} from "./store.js";

export const importWrapper = async (absolutePath) => {
  if (mockStore.has(absolutePath)) {
    const original = await import(absolutePath);
    const mockExports = mockStore.get(absolutePath);
    return {...original, ...mockExports};
  }
  return await import(absolutePath);
};

export const requireWrapper = (absolutePath) => {
  if (mockStore.has(absolutePath)) {
    const original = require(absolutePath);
    const mockExports = mockStore.get(absolutePath);
    return {...original, ...mockExports};
  }
  return require(absolutePath);
};