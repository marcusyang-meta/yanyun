/**
 * @generated SignedSource<<d27a0297afe25ea0ac427895e7532c7c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type StopGroupingRecurrenceInput = {
  groupingId: string;
};
export type GroupingDetailStopRecurrenceMutation$variables = {
  input: StopGroupingRecurrenceInput;
};
export type GroupingDetailStopRecurrenceMutation$data = {
  readonly stopGroupingRecurrence: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type GroupingDetailStopRecurrenceMutation = {
  response: GroupingDetailStopRecurrenceMutation$data;
  variables: GroupingDetailStopRecurrenceMutation$variables;
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
    "name": "stopGroupingRecurrence",
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
    "name": "GroupingDetailStopRecurrenceMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingDetailStopRecurrenceMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "850fb02285cee3162bfe403e63cb54bc",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailStopRecurrenceMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailStopRecurrenceMutation(\n  $input: StopGroupingRecurrenceInput!\n) {\n  stopGroupingRecurrence(input: $input) {\n    ok\n    error\n    grouping {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3ffe3afc0be179caef52e41722de03b8";

export default node;
