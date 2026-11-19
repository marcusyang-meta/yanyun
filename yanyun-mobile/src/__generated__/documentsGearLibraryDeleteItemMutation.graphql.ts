/**
 * @generated SignedSource<<6f442bc0b01ef929db7be75808485fd8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryDeleteItemMutation$variables = {
  id: string;
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
    "cacheID": "2ad9e7b05235c6443b1e92d7e18d51a8",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryDeleteItemMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryDeleteItemMutation(\n  $id: ID!\n) {\n  deleteGearItem(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "5ae1e50f3c47a91ff4f62e64fad8e275";

export default node;
