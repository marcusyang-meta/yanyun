/**
 * @generated SignedSource<<18885ec2a7dca4d9cfc485e0025f5e67>>
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
export type documentsMergeGroupingMutation$variables = {
  input: MergeGroupingInput;
};
export type documentsMergeGroupingMutation$data = {
  readonly mergeGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
      readonly status: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsMergeGroupingMutation = {
  response: documentsMergeGroupingMutation$data;
  variables: documentsMergeGroupingMutation$variables;
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
    "name": "documentsMergeGroupingMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsMergeGroupingMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "2f981c33fadc699ce10a7630a1aa2de6",
    "id": null,
    "metadata": {},
    "name": "documentsMergeGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsMergeGroupingMutation(\n  $input: MergeGroupingInput!\n) {\n  mergeGrouping(input: $input) {\n    ok\n    error\n    grouping {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a1fcd6a2fd446a99f41a23fb81b2637d";

export default node;
