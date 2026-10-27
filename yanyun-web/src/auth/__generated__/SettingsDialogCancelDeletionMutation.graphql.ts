/**
 * @generated SignedSource<<573fd6107ba7ee40151a6e8dcc62fa34>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogCancelDeletionMutation$variables = Record<PropertyKey, never>;
export type SettingsDialogCancelDeletionMutation$data = {
  readonly cancelAccountDeletion: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogCancelDeletionMutation = {
  response: SettingsDialogCancelDeletionMutation$data;
  variables: SettingsDialogCancelDeletionMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "AccountDeletionPayload",
    "kind": "LinkedField",
    "name": "cancelAccountDeletion",
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
    "name": "SettingsDialogCancelDeletionMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SettingsDialogCancelDeletionMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "42f1fdbb0f7702349d5d319964baf5ed",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogCancelDeletionMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogCancelDeletionMutation {\n  cancelAccountDeletion {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "bf769d1993164fdce68cbb06ed4a33d1";

export default node;
