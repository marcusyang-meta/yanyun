/**
 * @generated SignedSource<<b4778c7c2be53b3ee466d23381970281>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryDeleteBuildMutation$variables = {
  id: string;
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
    "cacheID": "809bba3718662a72a4a3355aa2762a2c",
    "id": null,
    "metadata": {},
    "name": "GearLibraryDeleteBuildMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryDeleteBuildMutation(\n  $id: ID!\n) {\n  deleteGearBuild(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "68cfce7a529986958707f97da6d9ef36";

export default node;
