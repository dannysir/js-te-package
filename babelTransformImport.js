import path from 'path';
import {BABEL, MOCK} from "./constants.js";

export const babelTransformImport = ({types: t}) => {
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
        const currentDir = path.dirname(currentFilePath);

        let absolutePath;
        if (source.startsWith(BABEL.PERIOD)) {
          absolutePath = path.resolve(currentDir, source);
        } else {
          absolutePath = source;
        }

        const specifiers = nodePath.node.specifiers;

        const moduleVarName = nodePath.scope.generateUidIdentifier(BABEL.MODULE);

        /*
        -예시-
        const _module = mockStore.has('./random.js')
          ? mockStore.get('./random.js')
          : await import('./random.js');
        */
        const moduleDeclaration = t.variableDeclaration(BABEL.CONST, [
          t.variableDeclarator(
            moduleVarName,
            t.conditionalExpression(
              t.callExpression(
                t.memberExpression(t.identifier(MOCK.STORE_NAME), t.identifier(BABEL.HAS)),
                [t.stringLiteral(absolutePath)]
              ),
              t.callExpression(
                t.memberExpression(t.identifier(MOCK.STORE_NAME), t.identifier(BABEL.GET)),
                [t.stringLiteral(absolutePath)]
              ),
              t.awaitExpression(
                t.importExpression(t.stringLiteral(source))
              )
            )
          )
        ]);

        const extractDeclarations = specifiers.map(spec => {
          let importedName, localName;

          if (t.isImportDefaultSpecifier(spec)) {
            importedName = 'default';
            localName = spec.local.name;
          } else if (t.isImportNamespaceSpecifier(spec)) {
            localName = spec.local.name;
            return t.variableDeclarator(
              t.identifier(localName),
              moduleVarName
            );
          } else {
            importedName = spec.imported.name;
            localName = spec.local.name;
          }

          return t.variableDeclarator(
            t.identifier(localName),
            t.memberExpression(moduleVarName, t.identifier(importedName))
          );
        });

        const extractDeclaration = t.variableDeclaration(BABEL.CONST, extractDeclarations);

        nodePath.replaceWithMultiple([moduleDeclaration, extractDeclaration]);
      },

      // CommonJS require() 처리
      VariableDeclarator(nodePath, state) {
        // init : require문
        const init = nodePath.node.init;

        if (!init || !t.isCallExpression(init)) {
          return;
        }

        if (!t.isIdentifier(init.callee, { name: 'require' })) {
          return;
        }

        const requireArgs = init.arguments;

        if (!requireArgs || requireArgs.length === 0) {
          return;
        }

        if (!t.isStringLiteral(requireArgs[0])) {
          return;
        }

        if (nodePath.node._transformed) {
          return;
        }

        const source = requireArgs[0].value;
        const currentFilePath = state.filename || process.cwd();
        const currentDir = path.dirname(currentFilePath);

        let absolutePath;
        if (source.startsWith(BABEL.PERIOD)) {
          absolutePath = path.resolve(currentDir, source);
        } else {
          absolutePath = source;
        }

        /*
        const _module1 = mockStore.has('/absolute/path/to/game.js')
        ? mockStore.get('/absolute/path/to/game.js')
        : require('./game.js');
         */
        const transformedRequire = t.conditionalExpression(
          t.callExpression(
            t.memberExpression(
              t.identifier(MOCK.STORE_NAME),
              t.identifier(BABEL.HAS)
            ),
            [t.stringLiteral(absolutePath)]
          ),
          t.callExpression(
            t.memberExpression(
              t.identifier(MOCK.STORE_NAME),
              t.identifier(BABEL.GET)
            ),
            [t.stringLiteral(absolutePath)]
          ),
          t.callExpression(
            t.identifier('require'),
            [t.stringLiteral(source)]
          )
        );

        nodePath.node._transformed = true;
        nodePath.node.init = transformedRequire;
      }
    }
  };
};