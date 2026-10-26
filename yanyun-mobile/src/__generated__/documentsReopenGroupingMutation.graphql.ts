/**
 * @generated SignedSource<<a3cea868ddcc2a4babeb42a6cfe8cdaf>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsReopenGroupingMutation$variables = {
  id: string;
};
export type documentsReopenGroupingMutation$data = {
  readonly reopenGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
      readonly status: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsReopenGroupingMutation = {
  response: documentsReopenGroupingMutation$data;
  variables: documentsReopenGroupingMutation$variables;
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
    "name": "reopenGrouping",
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
    "name": "documentsReopenGroupingMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsReopenGroupingMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "efb8c42a0730d4d6e050931335969691",
    "id": null,
    "metadata": {},
    "name": "documentsReopenGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsReopenGroupingMutation(\n  $id: ID!\n) {\n  reopenGrouping(id: $id) {\n    ok\n    error\n    grouping {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ef667fa1a824b0bafb0031842c6cde37";

export default node;
