export function resolve(...paths) {
  let firstPathSegment = paths.shift();
  if (!firstPathSegment) {
    return '/';
  }
  if (firstPathSegment[0] !== '/') {
    firstPathSegment = `/${firstPathSegment}`;
  }
  let resolvedParts = firstPathSegment === '/' ? [''] : firstPathSegment.split(/[/\\]/);

  for (const path of paths) {
    if (isAbsolute(path)) {
      resolvedParts = path.split(/[/\\]/);
    } else {
      const parts = path.split(/[/\\]/);

      while (parts[0] === '.' || parts[0] === '..') {
        const part = parts.shift();
        if (part === '..') {
          resolvedParts.pop();
        }
      }

      resolvedParts.push.apply(resolvedParts, parts);
    }
  }

  return resolvedParts.join('/');
}

export function dirname(path) {
  const match = /[\/\\][^/\\]*$/.exec(path);
  if (!match) return '.';

  const dir = path.slice(0, -match[0].length);

  // If `dir` is the empty string, we're at root.
  return dir ? dir : '/';
}

const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;

export function isAbsolute(path) {
  return absolutePath.test(path);
}
