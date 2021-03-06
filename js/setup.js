import { registerShowSlideUrl } from './show-slide-url.js';

Reveal.initialize({
  hash: true,
  progress: true,
  center: false,
  margin: 0.08,
  width: 1920,
  height: 1400,
  plugins: [RevealHighlight, RevealNotes]
}).then(() => {
  registerShowSlideUrl();
  import('./rollup-page.js');
  import('./static-codemirror.js');
  import('./terminal-page.js');
});
