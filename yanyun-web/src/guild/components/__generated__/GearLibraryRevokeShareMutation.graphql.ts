/**
 * @generated SignedSource<<830f9a42ee3ef7b2340fdc02dbfd94a9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryRevokeShareMutation$variables = {
  id: number;
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
    "cacheID": "1871a7e2ae0962f89a93bf49dc09ef1c",
    "id": null,
    "metadata": {},
    "name": "GearLibraryRevokeShareMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryRevokeShareMutation(\n  $id: Int!\n) {\n  revokeGearBuildShare(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "8dcb36d81a2b90e20dbb24f9c5cbfdb1";

export default node;
