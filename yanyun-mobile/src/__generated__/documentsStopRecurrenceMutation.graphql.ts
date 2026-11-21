/**
 * @generated SignedSource<<9dc157e8df2e157d55a20f79841cbe7f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type StopGroupingRecurrenceInput = {
  groupingId: string;
};
export type documentsStopRecurrenceMutation$variables = {
  input: StopGroupingRecurrenceInput;
};
export type documentsStopRecurrenceMutation$data = {
  readonly stopGroupingRecurrence: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly id: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsStopRecurrenceMutation = {
  response: documentsStopRecurrenceMutation$data;
  variables: documentsStopRecurrenceMutation$variables;
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
    "name": "documentsStopRecurrenceMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsStopRecurrenceMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "a9d8f4c7a26366deaedc960cc2d11b84",
    "id": null,
    "metadata": {},
    "name": "documentsStopRecurrenceMutation",
    "operationKind": "mutation",
    "text": "mutation documentsStopRecurrenceMutation(\n  $input: StopGroupingRecurrenceInput!\n) {\n  stopGroupingRecurrence(input: $input) {\n    ok\n    error\n    grouping {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "03ad385355d04f17ede772deffbbab01";

export default node;
