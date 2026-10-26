/**
 * @generated SignedSource<<9c5ae08063e74b378e077c7224e11dd4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsCompleteGroupingMutation$variables = {
  id: string;
};
export type documentsCompleteGroupingMutation$data = {
  readonly completeGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
      readonly status: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsCompleteGroupingMutation = {
  response: documentsCompleteGroupingMutation$data;
  variables: documentsCompleteGroupingMutation$variables;
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
    "concreteType": "GroupingPayload",
    "kind": "LinkedField",
    "name": "completeGrouping",
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
        "concreteType": "Grouping",
        "kind": "LinkedField",
        "name": "grouping",
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
    "name": "documentsCompleteGroupingMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsCompleteGroupingMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "ce6df0870021e9666a776a239843ae9e",
    "id": null,
    "metadata": {},
    "name": "documentsCompleteGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCompleteGroupingMutation(\n  $id: ID!\n) {\n  completeGrouping(id: $id) {\n    ok\n    error\n    grouping {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5d5dbb14dc4ad61d1ee8eb4d2ea3b6fb";

export default node;
