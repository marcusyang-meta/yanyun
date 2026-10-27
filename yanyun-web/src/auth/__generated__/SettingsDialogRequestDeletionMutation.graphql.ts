/**
 * @generated SignedSource<<abf9eeaa6c9daecec501eb323795cba6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogRequestDeletionMutation$variables = {
  typedUsername: string;
};
export type SettingsDialogRequestDeletionMutation$data = {
  readonly requestAccountDeletion: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly executesAt: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogRequestDeletionMutation = {
  response: SettingsDialogRequestDeletionMutation$data;
  variables: SettingsDialogRequestDeletionMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "typedUsername"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "typedUsername",
        "variableName": "typedUsername"
      }
    ],
    "concreteType": "AccountDeletionPayload",
    "kind": "LinkedField",
    "name": "requestAccountDeletion",
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
        "name": "executesAt",
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
    "name": "SettingsDialogRequestDeletionMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SettingsDialogRequestDeletionMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "793d2ed84e06094036101879fe85c40b",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogRequestDeletionMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogRequestDeletionMutation(\n  $typedUsername: String!\n) {\n  requestAccountDeletion(typedUsername: $typedUsername) {\n    ok\n    error\n    errorCode\n    executesAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "6e6e0db541379043a6df061a130dc8d4";

export default node;
