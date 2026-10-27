/**
 * @generated SignedSource<<104d408cef4645f6e7aaf6d336e54822>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryRevokeShareMutation$variables = {
  id: number;
};
export type documentsGearLibraryRevokeShareMutation$data = {
  readonly revokeGearBuildShare: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsGearLibraryRevokeShareMutation = {
  response: documentsGearLibraryRevokeShareMutation$data;
  variables: documentsGearLibraryRevokeShareMutation$variables;
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
    "name": "documentsGearLibraryRevokeShareMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGearLibraryRevokeShareMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "f9caf69817bec601b8c03773b60b6a73",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryRevokeShareMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryRevokeShareMutation(\n  $id: Int!\n) {\n  revokeGearBuildShare(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "340ee5f775e10ac11c4f14102056956e";

export default node;
