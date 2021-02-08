export const codeSamples = {
  mockFiles: {
    configInit: `export default {
  input: 'main.js',
  output: {
    format: 'es'
  }
}`,
    config: `export default {
  input: 'main.js',
  output: {
    format: 'es'
  }
}`,
    input: [
      {
        fileName: '/main.js',
        code: `import { foo } from './dangerous.js';
foo();`
      },
      {
        fileName: '/dangerous.js',
        code: `export function foo() {
  console.log('Only when developing');
}`
      }
    ]
  },
  patchFiles: {
    config: `export default {
  input: 'main.js',
  output: {
    format: 'es'
  }
}`,
    input: [{ fileName: '/main.js', code: `console.log('I want to log build information');` }]
  },
  virtualFiles: {
    config: `export default {
  input: 'main.js',
  output: {
    format: 'es'
  }
}`,
    input: [{ fileName: '/main.js', code: `console.log('I want to log build information');` }]
  }
};
