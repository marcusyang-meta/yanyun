/**
 * @generated SignedSource<<facdc50a6a02c9502f07b28c6a99240e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogUpdateThemeMutation$variables = {
  theme: string;
};
export type SettingsDialogUpdateThemeMutation$data = {
  readonly updateMyTheme: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly themePref: string;
  };
};
export type SettingsDialogUpdateThemeMutation = {
  response: SettingsDialogUpdateThemeMutation$data;
  variables: SettingsDialogUpdateThemeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "theme"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "theme",
        "variableName": "theme"
      }
    ],
    "concreteType": "UpdateThemePayload",
    "kind": "LinkedField",
    "name": "updateMyTheme",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "errorCode",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "themePref",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SettingsDialogUpdateThemeMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SettingsDialogUpdateThemeMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "58b866b7c6e4d05cbace955f9b054633",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogUpdateThemeMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogUpdateThemeMutation(\n  $theme: String!\n) {\n  updateMyTheme(theme: $theme) {\n    ok\n    error\n    errorCode\n    themePref\n  }\n}\n"
  }
};
})();

(node as any).hash = "50217346dcf488247de746a74350afa8";

export default node;
