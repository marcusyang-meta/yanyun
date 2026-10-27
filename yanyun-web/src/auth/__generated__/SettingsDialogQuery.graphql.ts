/**
 * @generated SignedSource<<f807e1176bc438f36fe825b1bd7a23cb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogQuery$variables = Record<PropertyKey, never>;
export type SettingsDialogQuery$data = {
  readonly gradPage: {
    readonly gearMyLibTitle: string;
  };
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
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "GradPage",
    "kind": "LinkedField",
    "name": "gradPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearMyLibTitle",
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
    "cacheID": "ac5324b366e4e01394c7f398e25a78af",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogQuery",
    "operationKind": "query",
    "text": "query SettingsDialogQuery {\n  viewer {\n    commonUnknownErrorText\n  }\n  settingsPage {\n    settingsTitle\n    settingsDiscordLabel\n    settingsLanguageLabel\n    settingsLanguageHint\n    settingsAutoLabel\n    settingsLangZhCnLabel\n    settingsLangZhTwLabel\n    settingsLangEnLabel\n    settingsLangEsLabel\n    settingsLangFrLabel\n    settingsSavedText\n    localePref\n    effectiveLocale\n  }\n  gradPage {\n    gearMyLibTitle\n  }\n}\n"
  }
};
})();

(node as any).hash = "eec7fffcc702d9cace23ac3119ad1b83";

export default node;
