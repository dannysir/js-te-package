import {changeModuleExports} from "./utils/changeModuleExports.js";

export const mockStore = new Map();

export const clearAllMocks = () => {
  mockStore.clear();
}

export const mock = (modulePath, mockExports) => {
  const mockedExports = changeModuleExports(mockExports);
  mockStore.set(modulePath, mockedExports);
  return mockStore.get(modulePath);
}

export const unmock = (modulePath) => {
  mockStore.delete(modulePath);
}

export const isMocked = (modulePath) => {
  return mockStore.has(modulePath);
}
