import {findAbsolutePath} from "./utils/pathHelper.js";

export const createMockCollectorPlugin = (mockedPaths) => {
  return ({types: t}) => {
    return {
      visitor: {
        CallExpression(nodePath, state) {
          if (!t.isIdentifier(nodePath.node.callee, {name: 'mock'})) {
            return;
          }

          const args = nodePath.node.arguments;
          if (args.length < 1 || !t.isStringLiteral(args[0])) {
            return;
          }

          const mockPath = args[0].value;
          const currentFilePath = state.filename || process.cwd();

          const absolutePath = findAbsolutePath(mockPath, currentFilePath);

          mockedPaths.add(absolutePath);
        }
      }
    };
  };
};
