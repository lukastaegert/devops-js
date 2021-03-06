import { rollup } from 'https://unpkg.com/rollup/dist/es/rollup.browser.js';
import { dirname, isAbsolute, resolve } from './path.js';

export async function rollUpPage(configCodeMirror, inputFiles) {
  const config = await getConfigObject(configCodeMirror);
  const warnings = [];
  config.plugins = config.plugins || [];
  config.onwarn = warning => warnings.push(warning);
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
  if (warnings.length) {
    output.unshift({
      fileName: 'Warnings',
      code: warnings.map(({ message }) => message).join('\n')
    });
  }
  return output;
}

async function getRolledUpCode(options) {
  const bundle = await rollup(options);
  return (await bundle.generate(options.output)).output;
}

async function getConfigObject(config) {
  const [{ code: output }] = await getRolledUpCode({
    input: 'main',
    treeshake: false,
    plugins: [
      {
        resolveId(id) {
          return id;
        },
        load(id) {
          return config.getValue();
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

function addJsExtensionIfNecessary(file, inputFiles) {
  let testedFile = file;
  if (inputFiles[file]) return testedFile;
  testedFile = `${file}.mjs`;
  if (inputFiles[file]) return testedFile;
  testedFile = `${file}.js`;
  if (inputFiles[file]) return testedFile;
  return file;
}
