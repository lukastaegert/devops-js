import { codeSamples } from './code-samples.js';
import { rollUpPage } from './rollup-integration.js';

const configName = 'rollup.config.js';

function wait() {
  return new Promise(resolve => setTimeout(resolve));
}

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
  }

  _removeFileContainer(codeMirror, delay = 0) {
    this._codeMirrors.delete(codeMirror);
    const fileContainer = codeMirror.display.wrapper.parentElement;
    fileContainer.classList.remove('zoom-in');
    fileContainer.style.animationDelay = `0.${delay}s`;
    fileContainer.clientHeight;
    fileContainer.classList.add('zoom-out');
    fileContainer.addEventListener('animationend', () => fileContainer.remove());
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
    const outputsToBeUpdated = new Set(Object.keys(this._output));
    for (const { fileName, code, source } of codeSamples) {
      const content = (typeof code === 'string' ? code : source).trim();
      if (outputsToBeUpdated.has(fileName)) {
        outputsToBeUpdated.delete(fileName);
        this._output[fileName].setValue(content);
        await wait();
      } else {
        this._output[fileName] = this._addOutputContainer(
          this._inputOutputColumn,
          fileName,
          content,
          delay++
        );
        await wait();
      }
    }
    for (const fileName of outputsToBeUpdated) {
      this._removeFileContainer(this._output[fileName], delay++);
      delete this._output[fileName];
      await wait();
    }
  }

  _addOutputContainer(parent, fileName, code, outputDelay) {
    const fileContainer = document.createElement('div');
    fileContainer.setAttribute('class', 'file-container output');
    fileContainer.innerHTML = `<label>${fileName}</label>`;
    parent.appendChild(fileContainer);
    fileContainer.classList.add('zoom-in');
    fileContainer.style.animationDelay = `0.${outputDelay++}s`;
    return this._createCodeMirror(fileContainer, code, true);
  }

  _createCodeMirror(parent, value, isOutput) {
    const codeMirror = CodeMirror(
      element => {
        parent.appendChild(element);
      },
      {
        mode: 'javascript',
        readOnly: isOutput && 'nocursor',
        scrollbarStyle: 'null',
        tabSize: 2,
        value
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
        this._needsUpdate = false;
        await wait();
        try {
          const output = await rollUpPage(this._config, this._input);
          await this._updateOutput(output);
          this._resizeCodeMirrors();
        } catch {
          this._updateOutput([]);
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
