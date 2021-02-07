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
    this._input = this._createColumnFromCode(codeSample.input);
    this._registerResizeHandler();
  }

  _createColumnContainer() {
    this._columnContainer = document.createElement('div');
    this._columnContainer.setAttribute('class', 'two-columns');
    this.appendChild(this._columnContainer);
  }

  _createConfigColumn(config) {
    const configColumn = this._createColumnFromCode([{ fileName: configName, code: config }]);
    this._config = configColumn.files[configName];
    const rollupButton = document.createElement('button');
    rollupButton.innerText = 'ROLLUP';
    rollupButton.onclick = async () => {
      this._removeColumn(this._input);
      const output = await rollUpPage(this._config, this._input.files);
      this._output = this._createColumnFromCode(output);
      this._resizeCodeMirrors();
    };
    configColumn.column.appendChild(rollupButton);
  }

  _createColumnFromCode(codeSamples) {
    const column = document.createElement('div');
    column.setAttribute('class', 'column');
    const output = {
      column,
      files: {}
    };
    for (const { fileName, code } of codeSamples) {
      output.files[fileName] = this._addFileContainer(column, fileName, code);
    }
    this._columnContainer.appendChild(column);
    return output;
  }

  _removeColumn(columnContent) {
    for (const fileName of Object.keys(columnContent.files)) {
      const codeMirror = columnContent.files[fileName];
      if (!this._codeMirrors.has(codeMirror)) {
        throw new Error(`Could not find codeMirror for ${fileName}`);
      }
      this._codeMirrors.delete(codeMirror);
    }
    columnContent.column.remove();
  }

  _addFileContainer(parent, fileName, code) {
    const fileContainer = document.createElement('div');
    fileContainer.setAttribute('class', 'file-container');
    fileContainer.innerHTML = `<label>${fileName}</label>`;
    parent.appendChild(fileContainer);
    return this._createCodeMirror(fileContainer, code);
  }

  _createCodeMirror(parent, value) {
    const codeMirror = CodeMirror(
      element => {
        parent.appendChild(element);
      },
      {
        mode: 'javascript',
        tabSize: 2,
        value
      }
    );
    this._codeMirrors.add(codeMirror);
    return codeMirror;
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
    this._refreshCodeMirrors();
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
