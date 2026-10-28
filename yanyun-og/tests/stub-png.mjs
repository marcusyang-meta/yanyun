import { readFileSync } from 'node:fs';
export default readFileSync(new URL('../generic.png', import.meta.url));
