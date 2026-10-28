import { readFileSync } from 'node:fs';
export default readFileSync(new URL('../generic.svg', import.meta.url), 'utf8');
