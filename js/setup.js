Reveal.initialize({
  hash: true,
  progress: true,
  center: false,
  plugins: [RevealHighlight, RevealNotes]
}).then(() => import('./rollup-page.js'));
