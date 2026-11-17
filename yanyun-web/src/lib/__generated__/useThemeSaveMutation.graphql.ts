/**
 * @generated SignedSource<<acfb4f6890fe7a8084efcea12b5580c9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useThemeSaveMutation$variables = {
  theme: string;
};
export type useThemeSaveMutation$data = {
  readonly updateMyTheme: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly themePref: string;
  };
};
export type useThemeSaveMutation = {
  response: useThemeSaveMutation$data;
  variables: useThemeSaveMutation$variables;
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
    "name": "useThemeSaveMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useThemeSaveMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "2bff58db1b0444348683525884f2dd01",
    "id": null,
    "metadata": {},
    "name": "useThemeSaveMutation",
    "operationKind": "mutation",
    "text": "mutation useThemeSaveMutation(\n  $theme: String!\n) {\n  updateMyTheme(theme: $theme) {\n    ok\n    error\n    errorCode\n    themePref\n  }\n}\n"
  }
};
})();

(node as any).hash = "94d1c8365e9564c6cf0addf528a05ee9";

export default node;
