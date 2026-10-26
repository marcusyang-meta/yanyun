/**
 * @generated SignedSource<<a144ad6dac5374856da29379ad38c3ae>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingDetailReopenMutation$variables = {
  id: string;
};
export type GroupingDetailReopenMutation$data = {
  readonly reopenGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
      readonly status: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type GroupingDetailReopenMutation = {
  response: GroupingDetailReopenMutation$data;
  variables: GroupingDetailReopenMutation$variables;
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
    "name": "GroupingDetailReopenMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingDetailReopenMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "1697390a350432d2cd98c328349256f5",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailReopenMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailReopenMutation(\n  $id: ID!\n) {\n  reopenGrouping(id: $id) {\n    ok\n    error\n    grouping {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bc4110cd1072b17430f3e10bb7301593";

export default node;
