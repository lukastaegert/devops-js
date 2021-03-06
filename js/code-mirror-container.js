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
    const transform = `scale(${1 / Reveal.getScale()})`;
    for (const element of this.querySelectorAll(
      '.slides .CodeMirror-cursors, .CodeMirror-measure:nth-child(2) + div'
    )) {
      element.style.transform = transform;
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
