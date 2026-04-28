import {findAbsolutePath, shouldTransform} from "./utils/pathHelper.js";
import {getModuleInfo} from "./utils/getModuleInfo.js";
import {buildTransformPair} from "./utils/transformBuilder.js";
import {BABEL, MOCK} from "../constants/babel.js";

const normalizeImportSpecifiers = (t, specifiers) => specifiers.map(spec => {
  if (t.isImportDefaultSpecifier(spec)) {
    return {importedName: 'default', localName: spec.local.name, isNamespace: false};
  }
  if (t.isImportNamespaceSpecifier(spec)) {
    return {importedName: null, localName: spec.local.name, isNamespace: true};
  }
  return {importedName: spec.imported.name, localName: spec.local.name, isNamespace: false};
});

const normalizeRequireDeclarator = (t, declarator) => {
  if (t.isObjectPattern(declarator.id)) {
    return declarator.id.properties.map(prop => ({
      importedName: prop.key.name,
      localName: prop.value.name,
      isNamespace: false,
    }));
  }
  return [{
    importedName: 'default',
    localName: declarator.id.name,
    isNamespace: false,
  }];
};

export const babelTransform = (mockedPaths = null) => {
  return ({types: t}) => {
    return {
      visitor: {
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

          const originalVar = nodePath.scope.generateUidIdentifier('original');
          const bindings = normalizeImportSpecifiers(t, nodePath.node.specifiers);

          const {originalDecl, wrapperDecls} = buildTransformPair({
            t,
            source,
            absolutePath,
            bindings,
            originalVar,
            isRequire: false,
          });

          nodePath.replaceWithMultiple([
            originalDecl,
            t.variableDeclaration(BABEL.CONST, wrapperDecls),
          ]);
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
            const bindings = normalizeRequireDeclarator(t, declarator);

            const {originalDecl, wrapperDecls} = buildTransformPair({
              t,
              source,
              absolutePath,
              bindings,
              originalVar,
              isRequire: true,
            });

            newDeclarations.push(...originalDecl.declarations, ...wrapperDecls);
          }

          if (hasTransformation) {
            nodePath.node.declarations = newDeclarations;
            nodePath.node._transformed = true;
          }
        },

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

          nodePath.node.arguments[0] = t.stringLiteral(absolutePath);
        },
      }
    };
  }
};
