import { rollup } from 'https://unpkg.com/rollup/dist/es/rollup.browser.js';
import { dirname, isAbsolute, resolve } from './path.js';
import { code } from './setup.js';

async function getRolledUpCode(options) {
  const bundle = await rollup(options);
  return (await bundle.generate(options.output)).output[0].code;
}

async function getConfigObject(codeMirrorId) {
  const output = await getRolledUpCode({
    input: 'main',
    treeshake: false,
    plugins: [
      {
        resolveId(id) {
          return id;
        },
        load(id) {
          return code[codeMirrorId].config.getValue();
        }
      }
    ],
    output: { format: 'cjs', exports: 'named' }
  });
  const runCode = new Function('module', 'exports', output);
  const module = { exports: {} };
  runCode(module, module.exports);
  return module.exports.default;
}

window.rollUpCode = async function (codeMirrorId) {
  const inputFiles = code[codeMirrorId].files;
  const config = await getConfigObject(codeMirrorId);
  config.plugins = config.plugins || [];
  config.plugins.push({
    name: 'presentation-plugin',
    resolveId(source, importer) {
      if (importer !== undefined && !isAbsolute(source) && source[0] !== '.') return null;
      return addJsExtensionIfNecessary(
        importer ? resolve(dirname(importer), source) : resolve(source),
        inputFiles
      );
    },
    load(id) {
      const codeMirror = inputFiles[id];
      if (codeMirror) {
        return codeMirror.getValue();
      }
    }
  });
  const output = await getRolledUpCode(config);
  code[codeMirrorId].output.setValue(output.trim());
};

function addJsExtensionIfNecessary(file, inputFiles) {
  let testedFile = file;
  if (inputFiles[file]) return testedFile;
  testedFile = `${file}.mjs`;
  if (inputFiles[file]) return testedFile;
  testedFile = `${file}.js`;
  if (inputFiles[file]) return testedFile;
  return file;
}
