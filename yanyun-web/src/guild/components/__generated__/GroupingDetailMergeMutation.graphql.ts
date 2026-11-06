/**
 * @generated SignedSource<<7fce834c0a52565f15950f80b23308eb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MergeGroupingInput = {
  sourceId: string;
  targetId: string;
};
export type GroupingDetailMergeMutation$variables = {
  input: MergeGroupingInput;
};
export type GroupingDetailMergeMutation$data = {
  readonly mergeGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
      readonly status: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type GroupingDetailMergeMutation = {
  response: GroupingDetailMergeMutation$data;
  variables: GroupingDetailMergeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "GroupingPayload",
    "kind": "LinkedField",
    "name": "mergeGrouping",
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
    "name": "GroupingDetailMergeMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingDetailMergeMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "f3311a285613341e72028f0377bbb0d6",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailMergeMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailMergeMutation(\n  $input: MergeGroupingInput!\n) {\n  mergeGrouping(input: $input) {\n    ok\n    error\n    grouping {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "697fea6b6bb747059c75720418735aae";

export default node;
