// Minimal permissive DOM stub so the original gear-planner script can run in Node.
// Elements are generic proxies: any property read returns a callable chainable stub.
function makeEl() {
  const el = {
    children: [], style: {}, dataset: {}, classList: {
      add() {}, remove() {}, toggle() {}, contains() { return false; }
    },
    value: "", innerHTML: "", textContent: "", checked: false,
    addEventListener() {}, removeEventListener() {}, appendChild(c) { el.children.push(c); return c; },
    remove() {}, querySelector() { return makeEl(); }, querySelectorAll() { return []; },
    closest() { return null; }, setAttribute() {}, getAttribute() { return null; },
    scrollIntoView() {}, focus() {}, click() {}, select() {},
  };
  return el;
}
const byId = {};
global.document = {
  getElementById(id) { return byId[id] || (byId[id] = makeEl()); },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  createElement() { return makeEl(); },
  addEventListener() {},
  body: makeEl(),
  documentElement: makeEl(),
};
global.window = global;
global.navigator = { clipboard: null, userAgent: "node" };
const store = {};
global.localStorage = {
  getItem(k) { return k in store ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; },
};
global.__gpStore = store;
