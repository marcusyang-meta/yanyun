/**
 * @generated SignedSource<<eb85bc9ad6e310e6411640ba08ed815b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryShareBuildMutation$variables = {
  id: number;
};
export type GearLibraryShareBuildMutation$data = {
  readonly shareGearBuild: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly shareUrl: string | null | undefined;
  };
};
export type GearLibraryShareBuildMutation = {
  response: GearLibraryShareBuildMutation$data;
  variables: GearLibraryShareBuildMutation$variables;
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
    "concreteType": "GearBuildSharePayload",
    "kind": "LinkedField",
    "name": "shareGearBuild",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareUrl",
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
    "name": "GearLibraryShareBuildMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibraryShareBuildMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "9247c6e1392c3ab3ad3545f846630af5",
    "id": null,
    "metadata": {},
    "name": "GearLibraryShareBuildMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryShareBuildMutation(\n  $id: Int!\n) {\n  shareGearBuild(id: $id) {\n    ok\n    error\n    shareUrl\n  }\n}\n"
  }
};
})();

(node as any).hash = "460b77c21bca1d7082475a521a1f7a58";

export default node;
