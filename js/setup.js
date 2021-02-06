Reveal.initialize({
  hash: true,
  progress: true,
  disableLayout: true,
  plugins: [RevealHighlight, RevealNotes]
});

export const code = {};

setTimeout(() => {
  const codeMirrorInstances = [];

  for (const element of document.querySelectorAll('[code-mirror]')) {
    const codeMirrorInstance = CodeMirror.fromTextArea(element, {
      mode: 'javascript'
    });
    codeMirrorInstances.push(codeMirrorInstance);
    const [session, type] = element.getAttribute('code-mirror').split('.');
    const sessionObject = (code[session] = code[session] || {});
    if (type === 'input') {
      sessionObject.files = sessionObject.files || {};
      const id = document.querySelector(`label[for="${element.id}"]`).textContent;
      sessionObject.files[id] = codeMirrorInstance;
    } else {
      sessionObject[type] = codeMirrorInstance;
    }
  }

  Reveal.on('resize', resizeCodeWindows);
  resizeCodeWindows();

  function resizeCodeWindows() {
    const scaleFactorMatch = document
      .querySelector('.slides')
      .style.transform.match(/scale\(([^)]+)\)/);
    const scaleFactor = scaleFactorMatch ? Number(scaleFactorMatch[1]) : 1;
    for (const cursor of document.querySelectorAll(
      '.slides .CodeMirror-cursors, .CodeMirror-measure:nth-child(2) + div'
    )) {
      cursor.style.transform = `scale(${1 / scaleFactor})`;
      cursor.style.transformOrigin = `0 0`;
    }
    for (const instance of codeMirrorInstances) {
      instance.refresh();
    }
  }
});
