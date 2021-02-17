class StaticCodemirror extends HTMLElement {
  constructor() {
    super();
    const value = this.textContent.trim();
    while (this.firstChild) {
      this.firstChild.remove();
    }
    this._codeMirror = CodeMirror(
      element => {
        this.appendChild(element);
      },
      {
        mode: 'javascript',
        readOnly: 'nocursor',
        scrollbarStyle: 'null',
        tabSize: 2,
        value
      }
    );
    this._registerResizeHandler();
  }

  // TODO this might be inherited from a shared component
  _registerResizeHandler() {
    let parent = this.parentElement;
    while (parent && parent.tagName !== 'SECTION') {
      parent = parent.parentElement;
    }
    Reveal.on('resize', () => this._resizeCodeMirror());
    Reveal.on('slidechanged', ({ currentSlide }) => {
      if (parent === currentSlide) {
        this._codeMirror.refresh();
      }
    });
    this._resizeCodeMirror();
  }

  _resizeCodeMirror() {
    const scaleFactorMatch = document
      .querySelector('.slides')
      .style.transform.match(/scale\(([^)]+)\)/);
    const scaleFactor = scaleFactorMatch ? Number(scaleFactorMatch[1]) : 1;
    for (const element of this.querySelectorAll(
      '.slides .CodeMirror-cursors, .CodeMirror-measure:nth-child(2) + div'
    )) {
      element.style.transform = `scale(${1 / scaleFactor})`;
      element.style.transformOrigin = `0 0`;
    }
    this._codeMirror.refresh();
  }
}

customElements.define('static-codemirror', StaticCodemirror);
