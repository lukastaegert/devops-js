Own your build-step—own your code

Why we bundle
JavaScript development used to be fun:
- Direct feedback, you write the code you get
- This is coming back for the frontend for development: Vite, Snowpack, web-dev-server
- Why not for production?
    - Optimal browser code != optimal developer code
    - Performance
        - Bandwidth
            - Minification, DCE
        - The waterfall
            - Still present for HTTP2, though less
- But on the server, there is no reason to do that, right?
    - GraphQL example
- What makes Rollup special
    - Superior DCE without minification
        - Count AST Nodes Webpack vs Rollup (Parcel, esbuild)
    - ESM first no-overhead bundling
    - Very customisable, 6 output formats
        - AMD, SystemJS: code-splitting with external runtime
          Customise your code
- Mock/replace files in dependencies via load hook
- Fully virtualise a build
- Add custom information
    - Git commit/branch, with parameter (hash length)
- ?Patch code (advantage over replace: single file
- Import information about the current build
  Sometimes you want pieces
- Only load/parse/execute what you need
- Improve website, command line tool startup
- Allow different entry points for a library
- Two ways to split
    - Different entry points
    - Dynamic import
        - Fewer chunks when not preserving entry signatures
    - Different entry points with implicit order via plugin interface
- Patch things up with manualChunks
  Get the DX you want
  Web development:
- Vite (Rollup for CJS dependencies, optionally build)
- Snowpack (Rollup for CJS dependencies, optionally build)
- Stencil (Web Components)
  Library Development
- TSDX
- Microbundle

