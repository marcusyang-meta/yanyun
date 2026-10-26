import { readFileSync } from 'node:fs';
export default readFileSync(new URL('../resvg.wasm', import.meta.url));
