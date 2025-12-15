/**
 * require 호출 정보 추출
 * @param {Object} t - Babel types
 * @param {Object} declarator - VariableDeclarator 노드
 * @returns {Object|null} require 정보 또는 null
 */
export const getModuleInfo = (t, declarator) => {
  const init = declarator.init;

  if (!init ||
    !t.isCallExpression(init) ||
    !t.isIdentifier(init.callee, {name: 'require'}) ||
    !init.arguments[0] ||
    !t.isStringLiteral(init.arguments[0])) {
    return null;
  }

  return {
    source: init.arguments[0].value
  };
}