import { CodeMirrorContainer } from './code-mirror-container.js';

class StaticCodemirror extends CodeMirrorContainer {
  constructor() {
    super();
    const value = this.textContent.trim();
    while (this.firstChild) {
      this.firstChild.remove();
    }
    this._codeMirrors.add(
      CodeMirror(
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
      )
    );
    this._resizeCodeMirrors();
  }
}

customElements.define('static-codemirror', StaticCodemirror);
