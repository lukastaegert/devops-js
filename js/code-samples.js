export const codeSamples = {
  injectInformation: {
    config: `export default {
  input: 'main.js',
  output: {
    format: 'es'
  }
}`,
    configExpected: `export default {
  input: 'main.js',
  plugins: [{
    load(id) {
      if (id === '/build.js') {
        return 'export const type ' +
          "= 'production';";
      }
    }
  }],
  output: {
    format: 'es'
  }
}`,
    input: [
      {
        fileName: '/main.js',
        code: `import { type } from './build.js';
console.log(\`Built for $\{type}.\`);`
      },
      {
        fileName: '/build.js',
        code: `export const type = 'development';`
      }
    ]
  },
  patchFiles: {
    config: `export default {
  input: 'main.js',
  plugins: [{
    transform(code) {
    }
  }],
  output: {
    format: 'es'
  }
}`,
    configExpected: `export default {
  input: 'main.js',
  plugins: [{
    transform(code) {
      return code.replace(
        /\\/\\*REMOVE\\*\\/[^\\n]*\\n/g,
        ''
      );
    }
  }],
  output: {
    format: 'es'
  }
}`,
    input: [
      {
        fileName: '/main.js',
        code: `console.log('important');
/*REMOVE*/console.log('for debugging');
console.log('also important');`
      }
    ]
  },
  replaceFiles: {
    config: `export default {
  input: 'main.js',
  plugins: [{
    resolveId(src, importer) {
    }
  }],
  output: {
    format: 'es'
  }
}`,
    configExpected: `export default {
  input: 'main.js',
  plugins: [{
    async resolveId(src, importer) {
      const resolved = await this
        .resolve(src, importer,
          {skipSelf: true});
      if (resolved.id ===
          '/log-dev.js') {
        return '/log-prod.js';
      }
    }
  }],
  output: {
    format: 'es'
  }
}`,
    input: [
      {
        fileName: '/main.js',
        code: `import {log} from './log-dev.js';
log('Hello');`
      },
      {
        fileName: '/log-dev.js',
        code: `export const log = console.log
  .bind(console)`
      },
      {
        fileName: '/log-prod.js',
        code: `export const log = logger.log
  .bind(console)`
      }
    ]
  },
  virtualModules: {
    config: `export default {
  input: 'main.js',
  plugins: [{
    resolveId(src) {
    },
    load(id) {
    }
  }],
  output: {
    format: 'es'
  }
}`,
    configExpected: `export default {
  input: 'main.js',
  plugins: [{
    resolveId(src) {
      if (src === 'build') {
        return 'build';
      }
    },
    load(id) {
      if (id ===  'build') {
        return 'export const ' + 
          "env = 'prod'";
      }
    }
  }],
  output: {
    format: 'es'
  }
}`,
    input: [
      {
        fileName: '/main.js',
        code: `import { env } from 'build';
console.log(\`Built for $\{env}.\`);`
      }
    ]
  },
  buildInformation: {
    config: `export default {
  input: 'main.js',
  external: ['/build.js'],
  plugins: [{
    generateBundle(options, bundle) {
    }
  }],
  output: {
    format: 'es'
  }
}`,
    configExpected: `export default {
  input: 'main.js',
  external: ['/build.js'],
  plugins: [{
    generateBundle(options, bundle) {
      this.emitFile({
        type: 'asset',
        fileName: 'build.js',
        source: \`export const files =
'\${Object.keys(bundle).map(name =>
\`\${name}: \${bundle[name].code.length}\`)
        }';\`});
    }
  }],
  output: {
    format: 'es'
  }
}`,
    input: [
      {
        fileName: '/main.js',
        code: `import { files } from './build.js';
console.log(files);
import('./dynamic.js');
`
      },
      {
        fileName: '/dynamic.js',
        code: `console.log('dynamic chunk');`
      }
    ]
  }
};
