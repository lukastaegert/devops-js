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
    this._connection = new TerminalServerConnection(({ data, type }) => {
      this._appendOutput(data, type);
    });
  }

  _appendOutput(output, format) {
    const span = document.createElement('span');
    span.setAttribute('class', format);
    span.appendChild(document.createTextNode(output));
    this._output.appendChild(span);
    this._output.scrollTop = this._output.scrollHeight;
  }
}

customElements.define('terminal-page', TerminalPage);
