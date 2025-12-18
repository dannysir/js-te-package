export const mockStore = new Map();

export const clearAllMocks = () => {
  mockStore.clear();
}

export const mock = (modulePath, mockExports) => {
  mockStore.set(modulePath, mockExports);
}

export const unmock = (modulePath) => {
  mockStore.delete(modulePath);
}

export const isMocked = (modulePath) => {
  return mockStore.has(modulePath);
}
