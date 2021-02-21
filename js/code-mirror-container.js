export class CodeMirrorContainer extends HTMLElement {
  constructor() {
    super();
    this._codeMirrors = new Set();
    this._registerResizeHandler();
  }

  _registerResizeHandler() {
    let parent = this.parentElement;
    while (parent && parent.tagName !== 'SECTION') {
      parent = parent.parentElement;
    }
    Reveal.on('resize', () => this._resizeCodeMirrors());
    Reveal.on('slidechanged', ({ currentSlide }) => {
      if (parent === currentSlide) {
        this._refreshCodeMirrors();
      }
    });
  }

  _resizeCodeMirrors() {
    const slides = document.querySelector('.slides');
    const scaleFactorMatch = slides.style.transform.match(/scale\(([^)]+)\)/);
    const scaleFactor = scaleFactorMatch ? Number(scaleFactorMatch[1]) : 1;
    for (const element of this.querySelectorAll(
      '.slides .CodeMirror-cursors, .CodeMirror-measure:nth-child(2) + div'
    )) {
      element.style.transform = `scale(${1 / scaleFactor})`;
      element.style.transformOrigin = `0 0`;
    }
    this._refreshCodeMirrors();
  }

  _refreshCodeMirrors() {
    for (const codeMirror of this._codeMirrors) {
      codeMirror.refresh();
    }
  }
}
