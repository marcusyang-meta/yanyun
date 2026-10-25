/**
 * @generated SignedSource<<65330d03f7e04be4ded9782ac5ffcc1a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryDeleteItemMutation$variables = {
  id: number;
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
    "cacheID": "7f9655f799bdc68f1342b0955038c67f",
    "id": null,
    "metadata": {},
    "name": "GearLibraryDeleteItemMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryDeleteItemMutation(\n  $id: Int!\n) {\n  deleteGearItem(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "3d42f7d9a7aca1a58acacea14e31ee3b";

export default node;
