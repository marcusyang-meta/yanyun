/**
 * @generated SignedSource<<60580eef7c0d9396a72e8ef461c268fa>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogUpdateMutation$variables = {
  locale?: string | null | undefined;
};
export type SettingsDialogUpdateMutation$data = {
  readonly updateMyLocale: {
    readonly effectiveLocale: string;
    readonly error: string | null | undefined;
    readonly localePref: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogUpdateMutation = {
  response: SettingsDialogUpdateMutation$data;
  variables: SettingsDialogUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "locale"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "locale",
        "variableName": "locale"
      }
    ],
    "concreteType": "UpdateLocalePayload",
    "kind": "LinkedField",
    "name": "updateMyLocale",
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SettingsDialogUpdateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SettingsDialogUpdateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "3b4084e8e7f1e301623f055bfc3d94c1",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogUpdateMutation(\n  $locale: String\n) {\n  updateMyLocale(locale: $locale) {\n    ok\n    error\n    localePref\n    effectiveLocale\n  }\n}\n"
  }
};
})();

(node as any).hash = "03b7558bbd7305daa30494b5553641d8";

export default node;
