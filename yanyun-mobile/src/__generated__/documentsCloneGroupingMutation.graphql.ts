/**
 * @generated SignedSource<<cc140d8261059aaeab8a4a6c19dd84de>>
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
export type documentsCloneGroupingMutation$variables = {
  input: CloneGroupingInput;
};
export type documentsCloneGroupingMutation$data = {
  readonly cloneGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
    } | null | undefined;
    readonly ok: boolean;
    readonly skippedNames: ReadonlyArray<string>;
  };
};
export type documentsCloneGroupingMutation = {
  response: documentsCloneGroupingMutation$data;
  variables: documentsCloneGroupingMutation$variables;
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
    "name": "documentsCloneGroupingMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsCloneGroupingMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "2d112e82c84befbbcc2126993626237b",
    "id": null,
    "metadata": {},
    "name": "documentsCloneGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCloneGroupingMutation(\n  $input: CloneGroupingInput!\n) {\n  cloneGrouping(input: $input) {\n    ok\n    error\n    skippedNames\n    grouping {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1b2b5e93d2835fcd1e535b1341296eda";

export default node;
