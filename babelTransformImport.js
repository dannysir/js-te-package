import path from 'path';
import {BABEL, MOCK} from "./constants.js";

export const babelTransformImport = (mockedPaths = null) => {
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
          const currentDir = path.dirname(currentFilePath);

          let absolutePath;
          if (source.startsWith(BABEL.PERIOD)) {
            absolutePath = path.resolve(currentDir, source);
          } else {
            absolutePath = source;
          }

          if (mockedPaths && !mockedPaths.has(absolutePath)) {
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

          const originalDeclaration = t.variableDeclaration(BABEL.CONST, [
            t.variableDeclarator(
              originalVarName,
              t.awaitExpression(
                t.importExpression(t.stringLiteral(source))
              )
            )
          ]);

          const wrapperDeclarations = specifiers.map(spec => {
            let importedName, localName;

            if (t.isImportDefaultSpecifier(spec)) {
              importedName = 'default';
              localName = spec.local.name;
            } else if (t.isImportNamespaceSpecifier(spec)) {
              localName = spec.local.name;
              return t.variableDeclarator(
                t.identifier(localName),
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
              );
            } else {
              importedName = spec.imported.name;
              localName = spec.local.name;
            }

            return t.variableDeclarator(
              t.identifier(localName),
              t.arrowFunctionExpression(
                [t.restElement(t.identifier('args'))],
                t.blockStatement([
                  t.variableDeclaration(BABEL.CONST, [
                    t.variableDeclarator(
                      t.identifier(BABEL.MODULE),
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
                  ]),
                  t.returnStatement(
                    t.callExpression(
                      t.memberExpression(t.identifier(BABEL.MODULE), t.identifier(importedName)),
                      [t.spreadElement(t.identifier('args'))]
                    )
                  )
                ])
              )
            );
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
            const init = declarator.init;

            if (!init ||
              !t.isCallExpression(init) ||
              !t.isIdentifier(init.callee, {name: 'require'}) ||
              !init.arguments[0] ||
              !t.isStringLiteral(init.arguments[0])) {
              newDeclarations.push(declarator);
              continue;
            }

            const source = init.arguments[0].value;
            const currentFilePath = state.filename || process.cwd();
            const currentDir = path.dirname(currentFilePath);

            let absolutePath;
            if (source.startsWith(BABEL.PERIOD)) {
              absolutePath = path.resolve(currentDir, source);
            } else {
              absolutePath = source;
            }

            if (mockedPaths && !mockedPaths.has(absolutePath)) {
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
                  t.variableDeclarator(
                    t.identifier(localName),
                    t.arrowFunctionExpression(
                      [t.restElement(t.identifier('args'))],
                      t.blockStatement([
                        t.variableDeclaration(BABEL.CONST, [
                          t.variableDeclarator(
                            t.identifier(BABEL.MODULE),
                            t.conditionalExpression(
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
                            )
                          )
                        ]),
                        t.returnStatement(
                          t.callExpression(
                            t.memberExpression(
                              t.identifier(BABEL.MODULE),
                              t.identifier(key)
                            ),
                            [t.spreadElement(t.identifier('args'))]
                          )
                        )
                      ])
                    )
                  )
                );
              });
            } else {
              newDeclarations.push(
                t.variableDeclarator(
                  declarator.id,
                  t.arrowFunctionExpression(
                    [t.restElement(t.identifier('args'))],
                    t.blockStatement([
                      t.variableDeclaration(BABEL.CONST, [
                        t.variableDeclarator(
                          t.identifier(BABEL.MODULE),
                          t.conditionalExpression(
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
                          )
                        )
                      ]),
                      t.returnStatement(
                        t.callExpression(
                          t.memberExpression(
                            t.identifier(BABEL.MODULE),
                            t.identifier('default')
                          ),
                          [t.spreadElement(t.identifier('args'))]
                        )
                      )
                    ])
                  )
                )
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
  }
};
