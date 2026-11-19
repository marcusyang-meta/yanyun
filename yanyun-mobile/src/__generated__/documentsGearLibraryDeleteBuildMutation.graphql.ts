/**
 * @generated SignedSource<<7cf8201f5ec5a71862c3b6131536905a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryDeleteBuildMutation$variables = {
  id: string;
};
export type documentsGearLibraryDeleteBuildMutation$data = {
  readonly deleteGearBuild: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsGearLibraryDeleteBuildMutation = {
  response: documentsGearLibraryDeleteBuildMutation$data;
  variables: documentsGearLibraryDeleteBuildMutation$variables;
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
    "name": "documentsGearLibraryDeleteBuildMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGearLibraryDeleteBuildMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "7f5d4908c71ec762a25d0db3daa0b676",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryDeleteBuildMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryDeleteBuildMutation(\n  $id: ID!\n) {\n  deleteGearBuild(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c8c40852bd1812d5d6d4a68ec207e70";

export default node;
