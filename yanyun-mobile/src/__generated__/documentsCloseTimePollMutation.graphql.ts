/**
 * @generated SignedSource<<7ddf9852e722bef69c238e7cda4a2c55>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsCloseTimePollMutation$variables = {
  id: string;
};
export type documentsCloseTimePollMutation$data = {
  readonly closeTimePoll: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly poll: {
      readonly id: string;
      readonly status: string;
    } | null | undefined;
  };
};
export type documentsCloseTimePollMutation = {
  response: documentsCloseTimePollMutation$data;
  variables: documentsCloseTimePollMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "TimePollPayload",
    "kind": "LinkedField",
    "name": "closeTimePoll",
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
        "concreteType": "TimePoll",
        "kind": "LinkedField",
        "name": "poll",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          }
        ],
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
    "name": "documentsCloseTimePollMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsCloseTimePollMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "dd2d00969257e4b45ad7394667b71dd0",
    "id": null,
    "metadata": {},
    "name": "documentsCloseTimePollMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCloseTimePollMutation(\n  $id: ID!\n) {\n  closeTimePoll(id: $id) {\n    ok\n    error\n    errorCode\n    poll {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b771a1545ad10503ec83badfb25acf61";

export default node;
