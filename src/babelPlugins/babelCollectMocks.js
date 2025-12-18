import path from 'path';

import {BABEL} from "../constants/babel.js";

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
          const currentDir = path.dirname(currentFilePath);

          let absolutePath;
          if (mockPath.startsWith(BABEL.PERIOD)) {
            absolutePath = path.resolve(currentDir, mockPath);
          } else {
            absolutePath = mockPath;
          }

          mockedPaths.add(absolutePath);
        }
      }
    };
  };
};
