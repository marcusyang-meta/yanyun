/**
 * @generated SignedSource<<81be7ebbeb201c91be21665a74aae4b4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryRevokeShareMutation$variables = {
  id: string;
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
    "cacheID": "bab018d6627234caa6f41dc574e2bf88",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryRevokeShareMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryRevokeShareMutation(\n  $id: ID!\n) {\n  revokeGearBuildShare(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "e7ed617323bce6a5688a6cdeac999970";

export default node;
