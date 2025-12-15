import { BABEL, MOCK } from "../../constants.js";

/**
 * Mock wrapper 함수를 생성하는 헬퍼
 * @param {Object} t - Babel types
 * @param {string} importedName - import된 함수명
 * @param {string} localName - 로컬 변수명
 * @param {string} absolutePath - 모듈의 절대 경로
 * @param {Object} originalVarName - 원본 모듈을 가리키는 변수
 * @returns {Object} 바벨 변수 선언
 *
 * @example
 * // 반환 결과 (코드로 표현하면):
 * const random = (...args) => {
 *   const module = mockStore.has('/path/to/random.js')
 *     ? { ..._original, ...mockStore.get('/path/to/random.js') }
 *     : _original;
 *   return module.random(...args);
 * };
 */
export const createWrapperFunction = (t, importedName, localName, absolutePath, originalVarName) => {
  return t.variableDeclarator(
    t.identifier(localName),
    t.arrowFunctionExpression(
      [t.restElement(t.identifier('args'))],
      t.blockStatement([
        t.variableDeclaration(BABEL.CONST, [
          t.variableDeclarator(
            t.identifier(BABEL.MODULE),
            createConditionalModule(t, absolutePath, originalVarName)
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
};

/**
 * Namespace import용 wrapper 생성
 * @param {Object} t - Babel types
 * @param {string} localName - 로컬 변수명
 * @param {string} absolutePath - 모듈의 절대 경로
 * @param {Object} originalVarName - 원본 모듈 변수
 * @returns {Object} 바벨 변수 선언
 *
 * @example
 * // 반환 결과 (코드로 표현하면):
 * const utils = mockStore.has('/path/to/utils.js')
 *   ? { ..._original, ...mockStore.get('/path/to/utils.js') }
 *   : _original;
 */
export const createNamespaceWrapper = (t, localName, absolutePath, originalVarName) => {
  return t.variableDeclarator(
    t.identifier(localName),
    createConditionalModule(t, absolutePath, originalVarName)
  );
};

/**
 * 원본 모듈 선언문 생성
 * @param {Object} t - Babel types
 * @param {Object} originalVarName - 원본 모듈 변수
 * @param {string} source - import 경로
 * @param {boolean} isRequire - require 방식인지 여부
 * @returns {Object} 바벨 변수 선언
 *
 * @example
 * // isRequire = false인 경우 (코드로 표현하면):
 * const _original = await import('./random.js');
 *
 * // isRequire = true인 경우 (코드로 표현하면):
 * const _original = require('./random.js');
 */
export const createOriginalDeclaration = (t, originalVarName, source, isRequire = false) => {
  const init = isRequire
    ? t.callExpression(t.identifier('require'), [t.stringLiteral(source)])
    : t.awaitExpression(t.importExpression(t.stringLiteral(source)));

  return t.variableDeclaration(BABEL.CONST, [
    t.variableDeclarator(originalVarName, init)
  ]);
};

/**
 * 조건부 모듈 표현식 생성 (mockStore 체크)
 * @param {Object} t - Babel types
 * @param {string} absolutePath - 모듈의 절대 경로
 * @param {Object} originalVarName - 원본 모듈 변수
 * @returns {Object} 바벨 조건문
 *
 * @example
 * // 반환 결과 (코드로 표현하면):
 * mockStore.has('/path/to/random.js')
 *   ? { ..._original, ...mockStore.get('/path/to/random.js') }
 *   : _original
 */
const createConditionalModule = (t, absolutePath, originalVarName) => {
  return t.conditionalExpression(
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
  );
};
