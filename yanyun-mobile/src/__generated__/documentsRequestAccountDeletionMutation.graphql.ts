/**
 * @generated SignedSource<<95a8e85269c61e6fdcb1c03c82027654>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsRequestAccountDeletionMutation$variables = {
  typedUsername: string;
};
export type documentsRequestAccountDeletionMutation$data = {
  readonly requestAccountDeletion: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly executesAt: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsRequestAccountDeletionMutation = {
  response: documentsRequestAccountDeletionMutation$data;
  variables: documentsRequestAccountDeletionMutation$variables;
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
    "name": "documentsRequestAccountDeletionMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsRequestAccountDeletionMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "8bf51deb108413057053c6bdbca54444",
    "id": null,
    "metadata": {},
    "name": "documentsRequestAccountDeletionMutation",
    "operationKind": "mutation",
    "text": "mutation documentsRequestAccountDeletionMutation(\n  $typedUsername: String!\n) {\n  requestAccountDeletion(typedUsername: $typedUsername) {\n    ok\n    error\n    errorCode\n    executesAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "3ba66b04d1b67fb8f361ab29fbc4711c";

export default node;
