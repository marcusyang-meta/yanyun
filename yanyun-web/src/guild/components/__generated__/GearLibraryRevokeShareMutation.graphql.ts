/**
 * @generated SignedSource<<c4415eebaded826b1297df9f98f3d37c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryRevokeShareMutation$variables = {
  id: string;
};
export type GearLibraryRevokeShareMutation$data = {
  readonly revokeGearBuildShare: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GearLibraryRevokeShareMutation = {
  response: GearLibraryRevokeShareMutation$data;
  variables: GearLibraryRevokeShareMutation$variables;
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
    "name": "revokeGearBuildShare",
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
    "name": "GearLibraryRevokeShareMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibraryRevokeShareMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "55c9829ec50aba2d706b32a8d6917d8f",
    "id": null,
    "metadata": {},
    "name": "GearLibraryRevokeShareMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryRevokeShareMutation(\n  $id: ID!\n) {\n  revokeGearBuildShare(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "633ac6692a152c7015cc706209adf1e4";

export default node;
