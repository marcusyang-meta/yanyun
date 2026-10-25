/**
 * @generated SignedSource<<a0b0ef697b6fcba637e78ed93eccf8b5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryDeleteBuildMutation$variables = {
  id: number;
};
export type GearLibraryDeleteBuildMutation$data = {
  readonly deleteGearBuild: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GearLibraryDeleteBuildMutation = {
  response: GearLibraryDeleteBuildMutation$data;
  variables: GearLibraryDeleteBuildMutation$variables;
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
    "name": "deleteGearBuild",
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
    "name": "GearLibraryDeleteBuildMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibraryDeleteBuildMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "5f903d85372ad5ee1f1c457fd023b581",
    "id": null,
    "metadata": {},
    "name": "GearLibraryDeleteBuildMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryDeleteBuildMutation(\n  $id: Int!\n) {\n  deleteGearBuild(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "8c1ce9e1265ee71029a1bfc31c62136c";

export default node;
