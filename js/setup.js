Reveal.initialize({
  hash: true,
  progress: true,
  center: false,
  margin: 0.08,
  plugins: [RevealHighlight, RevealNotes]
}).then(() => {
  import('./rollup-page.js');
  import('./terminal-page.js');
});
