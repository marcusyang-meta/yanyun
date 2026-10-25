/**
 * @generated SignedSource<<bcebf6181f104ca9135829c7f1a3553c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryDeleteItemMutation$variables = {
  id: number;
};
export type documentsGearLibraryDeleteItemMutation$data = {
  readonly deleteGearItem: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsGearLibraryDeleteItemMutation = {
  response: documentsGearLibraryDeleteItemMutation$data;
  variables: documentsGearLibraryDeleteItemMutation$variables;
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
    "name": "documentsGearLibraryDeleteItemMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGearLibraryDeleteItemMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "12e19706b577758314828570cf0bc87c",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryDeleteItemMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryDeleteItemMutation(\n  $id: Int!\n) {\n  deleteGearItem(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "ea6a6cb752bcf75491f86569388eb871";

export default node;
