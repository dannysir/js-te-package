export const mockFunctions = (state) => {
  return {
    mockImplementation(newImpl) {
      state.curImplement = newImpl;
      return this;
    },

    mockReturnValueOnce(value) {
      state.returnQueue.push(value);
      return this;
    },

    mockReturnValue(value) {
      state.curImplement = () => value;
      return this;
    },

    mockClear() {
      state.returnQueue = [];
      state.curImplement = () => null;
      return this;
    },
  }

};