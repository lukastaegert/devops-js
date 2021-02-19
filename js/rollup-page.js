import { codeSamples } from './code-samples.js';
import { rollUpPage } from './rollup-integration.js';

const configName = 'rollup.config.js';

class RollupPage extends HTMLElement {
  constructor() {
    super();
    this._codeMirrors = new Set();
    const codeSample = codeSamples[this.getAttribute('code-sample')];
    this._createColumnContainer();
    this._createConfigColumn(codeSample.config);
    this._inputOutputColumn = document.createElement('div');
    this._columnContainer.appendChild(this._inputOutputColumn);
    this._input = this._createFilesFromCode(codeSample.input, this._inputOutputColumn);
    this._output = {};
    this.addEventListener('keypress', event => event.stopPropagation());
    this._registerResizeHandler();
  }

  _createColumnContainer() {
    this._columnContainer = document.createElement('div');
    this._columnContainer.setAttribute('class', 'two-columns');
    this.appendChild(this._columnContainer);
  }

  _createConfigColumn(config) {
    const configColumn = document.createElement('div');
    this._columnContainer.appendChild(configColumn);
    this._config = this._createFilesFromCode(
      [{ fileName: configName, code: config }],
      configColumn
    )[configName];
    this._config.on('focus', () => this._handleCodeChanges());
  }

  async _removeFileContainer(codeMirror, delay = 0) {
    this._codeMirrors.delete(codeMirror);
    const fileContainer = codeMirror.display.wrapper.parentElement;
    await zoomOut(fileContainer, delay);
  }

  _createFilesFromCode(codeSamples, container) {
    const files = {};
    for (const { fileName, code, source } of codeSamples) {
      files[fileName] = this._addFileContainer(
        container,
        fileName,
        (typeof code === 'string' ? code : source).trim()
      );
    }
    return files;
  }

  _addFileContainer(parent, fileName, code) {
    const fileContainer = document.createElement('div');
    fileContainer.setAttribute('class', 'file-container');
    fileContainer.innerHTML = `<label>${fileName}</label>`;
    parent.appendChild(fileContainer);
    return this._createCodeMirror(fileContainer, code);
  }

  async _updateOutput(codeSamples) {
    let delay = 0;
    const outputsToBeCreated = new Map();
    const outputsToBeUpdated = new Set(Object.keys(this._output));
    for (const { fileName, code, source } of codeSamples) {
      const content = (typeof code === 'string' ? code : source).trim();
      if (outputsToBeUpdated.has(fileName)) {
        outputsToBeUpdated.delete(fileName);
        if (content !== this._output[fileName].getValue()) {
          this._output[fileName].setValue(content);
        }
        await wait();
      } else {
        outputsToBeCreated.set(fileName, content);
      }
    }
    await Promise.all(
      [...outputsToBeUpdated].map(async fileName => {
        await this._removeFileContainer(this._output[fileName], delay++);
        delete this._output[fileName];
      })
    );
    for (const [fileName, content] of outputsToBeCreated) {
      this._output[fileName] = this._addOutputContainer(
        this._inputOutputColumn,
        fileName,
        content,
        delay++,
        ['Error', 'Warnings'].includes(fileName) ? { theme: 'error', mode: null } : {}
      );
      await wait();
    }
  }

  _addOutputContainer(parent, fileName, code, delay, options = {}) {
    const fileContainer = document.createElement('div');
    fileContainer.setAttribute('class', 'file-container output');
    fileContainer.innerHTML = `<label>${fileName}</label>`;
    parent.appendChild(fileContainer);
    zoomIn(fileContainer, delay);
    return this._createCodeMirror(fileContainer, code, { readOnly: 'nocursor', ...options });
  }

  _createCodeMirror(parent, value, options = {}) {
    const codeMirror = CodeMirror(
      element => {
        parent.appendChild(element);
      },
      {
        mode: 'javascript',
        scrollbarStyle: 'null',
        tabSize: 2,
        value,
        ...options
      }
    );
    this._codeMirrors.add(codeMirror);
    codeMirror.on('changes', () => this._handleCodeChanges());
    return codeMirror;
  }

  async _handleCodeChanges() {
    if (this._updating) {
      this._needsUpdate = true;
    } else {
      this._updating = true;
      do {
        await wait();
        this._needsUpdate = false;
        try {
          const output = await rollUpPage(this._config, this._input);
          await this._updateOutput(output);
          this._resizeCodeMirrors();
        } catch (error) {
          await this._updateOutput([{ fileName: 'Error', code: error.message }]);
        }
      } while (this._needsUpdate);
      this._updating = false;
    }
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
    this._resizeCodeMirrors();
  }

  _resizeCodeMirrors() {
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
    this._refreshCodeMirrors();
  }

  _refreshCodeMirrors() {
    for (const codeMirror of this._codeMirrors) {
      codeMirror.refresh();
    }
  }
}

customElements.define('rollup-page', RollupPage);

function wait() {
  return new Promise(resolve => setTimeout(resolve));
}

function zoomIn(element, delay = 0) {
  element.classList.add('zoom-in');
  element.style.animationDelay = `0.${delay++}s`;
}

function zoomOut(element, delay = 0) {
  return new Promise(resolve => {
    element.classList.remove('zoom-in');
    element.style.animationDelay = `0.${delay}s`;
    element.clientHeight;
    element.classList.add('zoom-out');
    element.addEventListener('animationend', () => {
      element.remove();
      resolve();
    });
  });
}
