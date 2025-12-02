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

        const originalVarName = nodePath.scope.generateUidIdentifier('original');
        const moduleVarName = nodePath.scope.generateUidIdentifier(BABEL.MODULE);

        /*
        Transformed code for partial mocking support in ESM:

        const _original = await import('./random.js');
        const _module = mockStore.has('/path/to/random.js')
          ? { ..._original, ...mockStore.get('/path/to/random.js') }
          : _original;
        const {random1, random2} = _module;
        */

        const originalDeclaration = t.variableDeclaration(BABEL.CONST, [
          t.variableDeclarator(
            originalVarName,
            t.awaitExpression(
              t.importExpression(t.stringLiteral(source))
            )
          )
        ]);

        const moduleDeclaration = t.variableDeclaration(BABEL.CONST, [
          t.variableDeclarator(
            moduleVarName,
            t.conditionalExpression(
              t.callExpression(
                t.memberExpression(t.identifier(MOCK.STORE_NAME), t.identifier(BABEL.HAS)),
                [t.stringLiteral(absolutePath)]
              ),
              t.objectExpression([
                t.spreadElement(originalVarName),
                t.spreadElement(
                  t.callExpression(
                    t.memberExpression(t.identifier(MOCK.STORE_NAME), t.identifier(BABEL.GET)),
                    [t.stringLiteral(absolutePath)]
                  )
                )
              ]),
              originalVarName
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

        nodePath.replaceWithMultiple([originalDeclaration, moduleDeclaration, extractDeclaration]);
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
          const init = declarator.init;

          if (!init ||
            !t.isCallExpression(init) ||
            !t.isIdentifier(init.callee, { name: 'require' }) ||
            !init.arguments[0] ||
            !t.isStringLiteral(init.arguments[0])) {
            newDeclarations.push(declarator);
            continue;
          }

          hasTransformation = true;
          const source = init.arguments[0].value;
          const currentFilePath = state.filename || process.cwd();
          const currentDir = path.dirname(currentFilePath);

        let absolutePath;
        if (source.startsWith(BABEL.PERIOD)) {
          absolutePath = path.resolve(currentDir, source);
        } else {
          absolutePath = source;
        }

          /*
          Transformed code for partial mocking support:

          const _original = require('./random');
          const _module = mockStore.has('/path/to/random.js')
            ? { ..._original, ...mockStore.get('/path/to/random.js') }
            : _original;
          */

          const originalVar = nodePath.scope.generateUidIdentifier('original');
          const originalDeclarator = t.variableDeclarator(
            originalVar,
            t.callExpression(
              t.identifier('require'),
              [t.stringLiteral(source)]
            )
          );

          const transformedRequire = t.conditionalExpression(
            t.callExpression(
              t.memberExpression(
                t.identifier(MOCK.STORE_NAME),
                t.identifier(BABEL.HAS)
              ),
              [t.stringLiteral(absolutePath)]
            ),
            t.objectExpression([
              t.spreadElement(originalVar),
              t.spreadElement(
                t.callExpression(
                  t.memberExpression(
                    t.identifier(MOCK.STORE_NAME),
                    t.identifier(BABEL.GET)
                  ),
                  [t.stringLiteral(absolutePath)]
                )
              )
            ]),
            originalVar
          );

          if (t.isObjectPattern(declarator.id) || t.isArrayPattern(declarator.id)) {
            const tempVar = nodePath.scope.generateUidIdentifier('module');

            newDeclarations.push(originalDeclarator);

            newDeclarations.push(
              t.variableDeclarator(tempVar, transformedRequire)
            );

            newDeclarations.push(
              t.variableDeclarator(declarator.id, tempVar)
            );
          } else {
            newDeclarations.push(originalDeclarator);

            newDeclarations.push(
              t.variableDeclarator(declarator.id, transformedRequire)
            );
          }
        }

        if (hasTransformation) {
          nodePath.node.declarations = newDeclarations;
          nodePath.node._transformed = true;
        }
      }
    }
  };
};