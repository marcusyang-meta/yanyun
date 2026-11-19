/**
 * @generated SignedSource<<2125dbcc60f04e4d1d1a50d0a5fc2288>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryShareBuildMutation$variables = {
  id: string;
};
export type documentsGearLibraryShareBuildMutation$data = {
  readonly shareGearBuild: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly shareUrl: string | null | undefined;
  };
};
export type documentsGearLibraryShareBuildMutation = {
  response: documentsGearLibraryShareBuildMutation$data;
  variables: documentsGearLibraryShareBuildMutation$variables;
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
    "name": "documentsGearLibraryShareBuildMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGearLibraryShareBuildMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "989b5827924dccad52a34795c8e70827",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryShareBuildMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryShareBuildMutation(\n  $id: ID!\n) {\n  shareGearBuild(id: $id) {\n    ok\n    error\n    shareUrl\n  }\n}\n"
  }
};
})();

(node as any).hash = "19a54b38d98f94662f721b0e5d835be4";

export default node;
