/**
 * @generated SignedSource<<8402281c0f52474f25501d185c8bfa91>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDisbandGroupingMutation$variables = {
  id: string;
};
export type documentsDisbandGroupingMutation$data = {
  readonly disbandGrouping: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDisbandGroupingMutation = {
  response: documentsDisbandGroupingMutation$data;
  variables: documentsDisbandGroupingMutation$variables;
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
    "concreteType": "DeletePayload",
    "kind": "LinkedField",
    "name": "disbandGrouping",
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
    "name": "documentsDisbandGroupingMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsDisbandGroupingMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "b51825fec2bf1dccd6a4593489badb5f",
    "id": null,
    "metadata": {},
    "name": "documentsDisbandGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDisbandGroupingMutation(\n  $id: ID!\n) {\n  disbandGrouping(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "9aafed85438f68a6b7f133535b6f6886";

export default node;
