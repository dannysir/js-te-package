import {findAbsolutePath, shouldTransform} from "./utils/pathHelper.js";
import {getModuleInfo} from "./utils/getModuleInfo.js";
import {createNamespaceWrapper, createOriginalDeclaration, createWrapperFunction} from "./utils/wrapperCreator.js";
import {BABEL, MOCK} from "../constants/babel.js";

export const babelTransform = (mockedPaths = null) => {
  return ({types: t}) => {
    return {
      visitor: {
        Program(path) {
          const mockStoreDeclaration = t.VariableDeclaration('const', [
            t.VariableDeclarator(
              t.Identifier(MOCK.STORE_NAME),
              t.MemberExpression(
                t.Identifier('global'),
                t.Identifier(MOCK.STORE_NAME)
              )
            )
          ]);
          path.node.body.unshift(mockStoreDeclaration);
        },

        ImportDeclaration(nodePath, state) {
          const source = nodePath.node.source.value;

          if (source === MOCK.STORE_PATH) {
            return;
          }

          const currentFilePath = state.filename || process.cwd();
          const absolutePath = findAbsolutePath(source, currentFilePath);

          if (!shouldTransform(absolutePath, mockedPaths)) {
            return;
          }

          const specifiers = nodePath.node.specifiers;
          const originalVarName = nodePath.scope.generateUidIdentifier('original');

          /*

          const _original = await import('./random.js');
          const random = (...args) => {
            const module = mockStore.has('/path/to/random.js')
              ? { ..._original, ...mockStore.get('/path/to/random.js') }
              : _original;
            return module.random(...args);
          };
          */

          const originalDeclaration = createOriginalDeclaration(
            t,
            originalVarName,
            source,
            false
          );

          const wrapperDeclarations = specifiers.map(spec => {
            if (t.isImportDefaultSpecifier(spec)) {
              return createWrapperFunction(
                t,
                'default',
                spec.local.name,
                absolutePath,
                originalVarName
              );
            } else if (t.isImportNamespaceSpecifier(spec)) {
              return createNamespaceWrapper(
                t,
                spec.local.name,
                absolutePath,
                originalVarName
              );
            } else {
              return createWrapperFunction(
                t,
                spec.imported.name,
                spec.local.name,
                absolutePath,
                originalVarName
              );
            }
          });

          const wrapperDeclaration = t.variableDeclaration(BABEL.CONST, wrapperDeclarations);

          nodePath.replaceWithMultiple([originalDeclaration, wrapperDeclaration]);
        },

        VariableDeclaration(nodePath, state) {
          const declarations = nodePath.node.declarations;

          if (!declarations || declarations.length === 0) {
            return;
          }

          if (nodePath.node._transformed) {
            return;
          }

          const newDeclarations = [];
          let hasTransformation = false;

          for (const declarator of declarations) {
            const requireInfo = getModuleInfo(t, declarator);

            if (!requireInfo) {
              newDeclarations.push(declarator);
              continue;
            }

            const {source} = requireInfo;
            const currentFilePath = state.filename || process.cwd();
            const absolutePath = findAbsolutePath(source, currentFilePath);

            if (!shouldTransform(absolutePath, mockedPaths)) {
              newDeclarations.push(declarator);
              continue;
            }

            hasTransformation = true;
            const originalVar = nodePath.scope.generateUidIdentifier('original');

            /*

            const _original = require('./random');
            const random = (...args) => {
              const module = mockStore.has('/path/to/random.js')
                ? { ..._original, ...mockStore.get('/path/to/random.js') }
                : _original;
              return module.random(...args);
            };
            */

            newDeclarations.push(
              t.variableDeclarator(
                originalVar,
                t.callExpression(
                  t.identifier('require'),
                  [t.stringLiteral(source)]
                )
              )
            );

            if (t.isObjectPattern(declarator.id)) {
              const properties = declarator.id.properties;

              properties.forEach(prop => {
                const key = prop.key.name;
                const localName = prop.value.name;

                newDeclarations.push(
                  createWrapperFunction(
                    t,
                    key,
                    localName,
                    absolutePath,
                    originalVar
                  )
                );
              });
            } else {
              newDeclarations.push(
                createWrapperFunction(
                  t,
                  'default',
                  declarator.id.name,
                  absolutePath,
                  originalVar
                )
              );
            }
          }

          if (hasTransformation) {
            nodePath.node.declarations = newDeclarations;
            nodePath.node._transformed = true;
          }
        },

        CallExpression(nodePath, state) {
          if (!t.isIdentifier(nodePath.node.callee, { name: 'mock' })) {
            return;
          }

          const args = nodePath.node.arguments;
          if (args.length < 1 || !t.isStringLiteral(args[0])) {
            return;
          }

          const mockPath = args[0].value;
          const currentFilePath = state.filename || process.cwd();

          const absolutePath = findAbsolutePath(mockPath, currentFilePath);

          nodePath.node.arguments[0] = t.stringLiteral(absolutePath);
        },
      }
    };
  }
};
