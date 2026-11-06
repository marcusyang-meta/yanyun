/**
 * @generated SignedSource<<c536561609ccce81fb89d0d4f2346d08>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CloneGroupingInput = {
  groupingId: string;
  startsAt: string;
  title?: string | null | undefined;
};
export type GroupingDetailCloneMutation$variables = {
  input: CloneGroupingInput;
};
export type GroupingDetailCloneMutation$data = {
  readonly cloneGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
    } | null | undefined;
    readonly ok: boolean;
    readonly skippedNames: ReadonlyArray<string>;
  };
};
export type GroupingDetailCloneMutation = {
  response: GroupingDetailCloneMutation$data;
  variables: GroupingDetailCloneMutation$variables;
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
    "concreteType": "CloneGroupingPayload",
    "kind": "LinkedField",
    "name": "cloneGrouping",
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
        "name": "skippedNames",
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
    "name": "GroupingDetailCloneMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingDetailCloneMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "446a6d0e69e8acebb42d7c2a7f56db80",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailCloneMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailCloneMutation(\n  $input: CloneGroupingInput!\n) {\n  cloneGrouping(input: $input) {\n    ok\n    error\n    skippedNames\n    grouping {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d1d33e04718f29a9c87b06d960a35515";

export default node;
