const mockStore = new Map();

export const remember = (key, value) => {
  mockStore.set(key, value);
};

export const recall = (key) => mockStore.get(key);

export const forget = (key) => {
  mockStore.delete(key);
};
