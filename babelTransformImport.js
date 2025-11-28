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
      CallExpression(nodePath, state) {
        // require() 호출이 아니면 무시
        if (!t.isIdentifier(nodePath.node.callee, { name: 'require' })) {
          return;
        }

        // require의 인자가 문자열 리터럴이 아니면 무시 (동적 require는 처리 안 함)
        if (!t.isStringLiteral(nodePath.node.arguments[0])) {
          return;
        }

        const source = nodePath.node.arguments[0].value;
        const currentFilePath = state.filename || process.cwd();
        const currentDir = path.dirname(currentFilePath);

        // 절대 경로로 변환
        let absolutePath;
        if (source.startsWith(BABEL.PERIOD)) {
          absolutePath = path.resolve(currentDir, source);
        } else {
          absolutePath = source;
        }

        // require() 호출을 mockStore 체크 로직으로 변환
        // require('./game.js')
        // ↓
        // mockStore.has('/abs/path') ? mockStore.get('/abs/path') : require('./game.js')
        const transformedRequire = t.conditionalExpression(
          // mockStore.has(absolutePath)
          t.callExpression(
            t.memberExpression(
              t.identifier(MOCK.STORE_NAME),
              t.identifier(BABEL.HAS)
            ),
            [t.stringLiteral(absolutePath)]
          ),
          // mockStore.get(absolutePath)
          t.callExpression(
            t.memberExpression(
              t.identifier(MOCK.STORE_NAME),
              t.identifier(BABEL.GET)
            ),
            [t.stringLiteral(absolutePath)]
          ),
          // require(원래경로)
          t.callExpression(
            t.identifier('require'),
            [t.stringLiteral(source)]
          )
        );

        nodePath.replaceWith(transformedRequire);
      }
    }
  };
};