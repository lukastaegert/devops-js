import { TerminalServerConnection } from './terminal-connection.js';

class TerminalPage extends HTMLElement {
  constructor() {
    super();
    this._createOutput();
    this._createInput();
    this._createServerConnection();
  }

  _createOutput() {
    const wrapper = document.createElement('pre');
    wrapper.classList.add('terminal-page-wrapper');
    this.appendChild(wrapper);
    this._output = document.createElement('code');
    this._output.setAttribute('class', 'terminal-page-code');
    wrapper.appendChild(this._output);
  }

  _createInput() {
    const input = document.createElement('input');
    input.setAttribute('value', this.getAttribute('input-value'));
    this.appendChild(input);
    input.addEventListener('keyup', ({ key }) => {
      if (key === 'Enter') {
        const value = `${input.value}\n`;
        this._connection.sendCommand(value);
        this._appendOutput(this._output.children.length ? `\n${value}` : value, 'terminal-input');
        input.value = '';
      }
    });
    this.addEventListener('transitionend', () => {
      if (this.classList.contains('current-fragment')) {
        input.focus({ preventScroll: true });
        input.selectionStart = input.selectionEnd = input.value.length;
      }
    });
  }

  _createServerConnection() {
    this._connection = new TerminalServerConnection(
      ({ data, type }) => this._appendOutput(data, type),
      () => {
        this._clearOutput();
        this._appendOutput(
          `This is not supported in the web version as it requires a locally
running server. You can check out the repository and run

npm install
npm start

to try it out.`,
          'terminal-error'
        );
      }
    );
  }

  _appendOutput(output, format) {
    const span = document.createElement('span');
    span.setAttribute('class', format);
    span.appendChild(document.createTextNode(output));
    this._output.appendChild(span);
    this._output.scrollTop = this._output.scrollHeight;
  }

  _clearOutput() {
    while (this._output.firstChild) {
      this._output.firstChild.remove();
    }
  }
}

customElements.define('terminal-page', TerminalPage);
