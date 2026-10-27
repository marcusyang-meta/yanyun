/**
 * @generated SignedSource<<ac45329323e883008a6faa06fb5e111f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsCancelAccountDeletionMutation$variables = Record<PropertyKey, never>;
export type documentsCancelAccountDeletionMutation$data = {
  readonly cancelAccountDeletion: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsCancelAccountDeletionMutation = {
  response: documentsCancelAccountDeletionMutation$data;
  variables: documentsCancelAccountDeletionMutation$variables;
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
    "name": "documentsCancelAccountDeletionMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsCancelAccountDeletionMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "730787cfbaa7590381922a841eb3083a",
    "id": null,
    "metadata": {},
    "name": "documentsCancelAccountDeletionMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCancelAccountDeletionMutation {\n  cancelAccountDeletion {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "5bfdf118a73ecdd9af681eba0106dd42";

export default node;
