import { parse } from 'acorn';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const file = resolve(process.argv[2]);
const program = parse(readFileSync(file, 'utf8'), { ecmaVersion: 2020, sourceType: 'module' });

const isNode = node => node && typeof node.type === 'string';

const nodes = [program];
for (const node of nodes) {
  for (const property of Object.values(node)) {
    if (Array.isArray(property)) {
      nodes.push(...property.filter(isNode));
    } else if (isNode(property)) {
      nodes.push(property);
    }
  }
}
console.log(`${nodes.length} nodes in ${file}`);
