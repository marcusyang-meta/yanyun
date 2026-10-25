/**
 * @generated SignedSource<<f3b9f2e0ef5847586ee4732ae5c2b499>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogQuery$variables = Record<PropertyKey, never>;
export type SettingsDialogQuery$data = {
  readonly settingsPage: {
    readonly effectiveLocale: string;
    readonly localePref: string | null | undefined;
    readonly settingsAutoLabel: string;
    readonly settingsDiscordLabel: string;
    readonly settingsLangEnLabel: string;
    readonly settingsLangEsLabel: string;
    readonly settingsLangFrLabel: string;
    readonly settingsLangZhCnLabel: string;
    readonly settingsLangZhTwLabel: string;
    readonly settingsLanguageHint: string;
    readonly settingsLanguageLabel: string;
    readonly settingsSavedText: string;
    readonly settingsTitle: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
  };
};
export type SettingsDialogQuery = {
  response: SettingsDialogQuery$data;
  variables: SettingsDialogQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonUnknownErrorText",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "SettingsPage",
    "kind": "LinkedField",
    "name": "settingsPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsDiscordLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLanguageLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLanguageHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsAutoLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangZhCnLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangZhTwLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangEnLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangEsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangFrLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsSavedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "localePref",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "effectiveLocale",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SettingsDialogQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SettingsDialogQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "908cb30f64a43552def13b289819ef03",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogQuery",
    "operationKind": "query",
    "text": "query SettingsDialogQuery {\n  viewer {\n    commonUnknownErrorText\n  }\n  settingsPage {\n    settingsTitle\n    settingsDiscordLabel\n    settingsLanguageLabel\n    settingsLanguageHint\n    settingsAutoLabel\n    settingsLangZhCnLabel\n    settingsLangZhTwLabel\n    settingsLangEnLabel\n    settingsLangEsLabel\n    settingsLangFrLabel\n    settingsSavedText\n    localePref\n    effectiveLocale\n  }\n}\n"
  }
};
})();

(node as any).hash = "86465879b769242ad71c2ec4ea34ce07";

export default node;
