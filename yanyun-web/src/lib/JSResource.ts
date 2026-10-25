// JSResource — the OSS stand-in for Relay's haste JSResource module.
//
// relay-compiler (moduleImportConfig: dynamicModuleProvider mode "JSResource")
// emits artifacts that call `JSResource('m#<ModuleName>')` to obtain a resource
// reference for:
//   * React components loaded by MatchContainer / entrypoint roots
//     (e.g. 'm#MemberGuildHome.react')
//   * SplitOperation normalization artifacts for @match fragments
//     (e.g. 'm#MemberGuildHome_guild$normalization.graphql'), resolved through
//     the Relay Environment's operationLoader.
//
// One resource object serves all three consumers:
//   * MatchContainer's `loader` prop      -> getComponent()
//   * EntryPoint root (loadEntryPoint)    -> getModuleIfRequired()/load()/getModuleId()
//   * Environment operationLoader         -> getModuleIfRequired()/load()
//
// Modules are discovered with import.meta.glob, so any component compiled
// into a @match branch or entrypoint root must live under src/**/*.react.tsx,
// and normalization artifacts under src/**/__generated__/*$normalization.graphql.ts.

import { createElement, type ComponentType } from 'react';

type ModuleNamespace = { default?: unknown };
type Loader = () => Promise<ModuleNamespace>;

const componentModules: Record<string, Loader> = import.meta.glob(
  '../**/*.react.tsx',
) as Record<string, Loader>;
const operationModules: Record<string, Loader> = import.meta.glob(
  '../**/__generated__/*$normalization.graphql.ts',
) as Record<string, Loader>;

function basename(path: string): string {
  const i = path.lastIndexOf('/');
  return i >= 0 ? path.slice(i + 1) : path;
}

function findLoader(name: string): Loader {
  // Component modules: 'MemberGuildHome.react' -> 'MemberGuildHome.react.tsx'
  for (const [path, loader] of Object.entries(componentModules)) {
    if (basename(path) === `${name}.tsx`) return loader;
  }
  // Normalization artifacts: 'MemberGuildHome_guild$normalization.graphql' -> '<name>.ts'
  for (const [path, loader] of Object.entries(operationModules)) {
    if (basename(path) === `${name}.ts`) return loader;
  }
  throw new Error(
    `JSResource: no module registered for '${name}'. ` +
      'Components must be *.react.tsx under src/, normalization artifacts under src/**/__generated__/.',
  );
}

export class JSResourceReference {
  readonly moduleId: string;
  #name: string;
  #loader: Loader | null = null;
  #promise: Promise<unknown> | null = null;
  #module: unknown = null;
  #error: unknown = null;
  #component: ComponentType<Record<string, unknown>> | null = null;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
    this.#name = moduleId.startsWith('m#') ? moduleId.slice(2) : moduleId;
  }

  getModuleId(): string {
    return this.moduleId;
  }

  #resolveLoader(): Loader {
    if (this.#loader == null) this.#loader = findLoader(this.#name);
    return this.#loader;
  }

  /** Start loading (idempotent). Resolves to the module's default export. */
  load(): Promise<unknown> {
    if (this.#promise == null) {
      this.#promise = this.#resolveLoader()().then(
        (ns) => {
          const value = (ns as ModuleNamespace).default ?? ns;
          this.#module = value;
          return value;
        },
        (err) => {
          this.#error = err;
          throw err;
        },
      );
    }
    return this.#promise;
  }

  /** The loaded default export, or null if not loaded yet (never starts a load). */
  getModuleIfRequired(): unknown {
    return this.#module;
  }

  /** Suspense-style read: returns the module, throws the pending promise or error. */
  read(): unknown {
    if (this.#module != null) return this.#module;
    if (this.#error != null) throw this.#error;
    throw this.load();
  }

  /**
   * A stable wrapper component that suspends until the module is loaded and
   * then renders it. This is what MatchContainer's `loader` prop returns.
   */
  getComponent(): ComponentType<Record<string, unknown>> {
    if (this.#component == null) {
      const self = this;
      function JSResourceComponent(props: Record<string, unknown>) {
        const C = self.read() as ComponentType<Record<string, unknown>>;
        return createElement(C, props);
      }
      JSResourceComponent.displayName = `JSResource(${this.#name})`;
      this.#component = JSResourceComponent;
    }
    return this.#component;
  }
}

const cache = new Map<string, JSResourceReference>();

export default function JSResource(moduleId: string): JSResourceReference {
  let ref = cache.get(moduleId);
  if (ref == null) {
    ref = new JSResourceReference(moduleId);
    cache.set(moduleId, ref);
  }
  return ref;
}

/**
 * MatchContainer `loader` prop. Relay hands the loader the value stored for
 * `__module_component`, which (with compiler-baked providers) is the artifact's
 * componentModuleProvider FUNCTION `() => JSResourceReference`; a server-sent
 * value would be the string instead (unused here — our backend sends no js
 * field, the baked provider wins). Returns a component that suspends until the
 * matched module is loaded.
 */
export function matchLoader(
  moduleProvider: unknown,
): ComponentType<Record<string, unknown>> | null {
  if (moduleProvider == null) return null;
  const resource =
    typeof moduleProvider === 'function'
      ? (moduleProvider as () => JSResourceReference)()
      : (moduleProvider as JSResourceReference);
  if (resource == null || typeof resource.getComponent !== 'function') return null;
  return resource.getComponent();
}

/**
 * Relay Environment operationLoader: resolves a @match followup payload's
 * operationReference (the artifact's operationModuleProvider function, or the
 * resource itself) to its SplitOperation node.
 */
export const jsOperationLoader = {
  get(operationReference: unknown): any {
    const resource = resolveResource(operationReference);
    return resource?.getModuleIfRequired() ?? null;
  },
  load(operationReference: unknown): Promise<any> {
    const resource = resolveResource(operationReference);
    if (resource == null) {
      return Promise.reject(
        new Error('JSResource: operationLoader received an unknown operationReference'),
      );
    }
    return resource.load();
  },
};

function resolveResource(ref: unknown): JSResourceReference | null {
  if (ref == null) return null;
  if (typeof ref === 'function') {
    const r = (ref as () => unknown)();
    return r instanceof JSResourceReference ? r : null;
  }
  return ref instanceof JSResourceReference ? ref : null;
}
