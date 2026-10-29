/**
 * @generated SignedSource<<a6dbdc27af8329314044eb468484a06a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryDeleteItemMutation$variables = {
  id: string;
};
export type GearLibraryDeleteItemMutation$data = {
  readonly deleteGearItem: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GearLibraryDeleteItemMutation = {
  response: GearLibraryDeleteItemMutation$data;
  variables: GearLibraryDeleteItemMutation$variables;
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
    "concreteType": "GearOkPayload",
    "kind": "LinkedField",
    "name": "deleteGearItem",
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
    "name": "GearLibraryDeleteItemMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibraryDeleteItemMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "c8ece068cddd8b06103d3dc8920de854",
    "id": null,
    "metadata": {},
    "name": "GearLibraryDeleteItemMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryDeleteItemMutation(\n  $id: ID!\n) {\n  deleteGearItem(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "41ad02352750e29a89309d555b450c1b";

export default node;
