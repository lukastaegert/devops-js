import { CodeMirrorContainer } from './code-mirror-container.js';
import { codeSamples } from './code-samples.js';
import { rollUpPage } from './rollup-integration.js';

const configName = 'rollup.config.js';

class RollupPage extends CodeMirrorContainer {
  constructor() {
    super();
    const codeSample = codeSamples[this.getAttribute('code-sample')];
    this._createColumnContainer();
    this._createConfigColumn(codeSample.config);
    this._inputOutputColumn = document.createElement('div');
    this._columnContainer.appendChild(this._inputOutputColumn);
    this._input = this._createFilesFromCode(codeSample.input, this._inputOutputColumn);
    this._expectedConfig = codeSample.configExpected;
    this._output = {};
    this.addEventListener('keypress', event => event.stopPropagation());
    this._resizeCodeMirrors();
  }

  _createColumnContainer() {
    this._columnContainer = document.createElement('div');
    this._columnContainer.classList.add('two-columns');
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
    this._config.setOption('extraKeys', {
      'Ctrl-S': () => this._config.setValue(this._expectedConfig)
    });
    const solutionButton = document.createElement('a');
    solutionButton.classList.add('solution-button');
    solutionButton.appendChild(document.createTextNode('Show Solution'));
    solutionButton.addEventListener('click', event => {
      event.preventDefault();
      this._config.setValue(this._expectedConfig);
    });
    configColumn.appendChild(solutionButton);
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
    fileContainer.classList.add('file-container');
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
        ['Error', 'Warnings'].includes(fileName)
          ? { theme: 'error', mode: null, lineWrapping: true }
          : {}
      );
      await wait();
    }
  }

  _addOutputContainer(parent, fileName, code, delay, options = {}) {
    const fileContainer = document.createElement('div');
    fileContainer.classList.add('file-container output');
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
