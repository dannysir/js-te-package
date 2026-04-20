import {createNamespaceWrapper, createOriginalDeclaration, createWrapperFunction} from "./wrapperCreator.js";

/**
 * ImportDeclaration/VariableDeclaration(require) 두 경로에서 공통으로 쓰는
 * "원본 선언 + wrapper 선언" 쌍을 생성한다.
 *
 * @param {Object}  args
 * @param {Object}  args.t            - Babel types
 * @param {string}  args.source       - 원본 모듈 경로(문자열 리터럴 값)
 * @param {string}  args.absolutePath - mockStore 키로 사용할 절대 경로
 * @param {Array<{importedName: string|null, localName: string, isNamespace: boolean}>} args.bindings
 * @param {Object}  args.originalVar  - 원본 모듈을 담을 식별자 노드
 * @param {boolean} args.isRequire    - CJS(require) 여부
 * @returns {{originalDecl: Object, wrapperDecls: Array<Object>}}
 *   originalDecl: VariableDeclaration 노드
 *   wrapperDecls: VariableDeclarator 노드 배열 (호출부가 감싸는 선언을 결정)
 */
export const buildTransformPair = ({t, source, absolutePath, bindings, originalVar, isRequire}) => {
  const originalDecl = createOriginalDeclaration(t, originalVar, source, isRequire);
  const wrapperDecls = bindings.map(({importedName, localName, isNamespace}) =>
    isNamespace
      ? createNamespaceWrapper(t, localName, absolutePath, originalVar)
      : createWrapperFunction(t, importedName, localName, absolutePath, originalVar)
  );
  return {originalDecl, wrapperDecls};
};
