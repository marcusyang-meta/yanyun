/**
 * @generated SignedSource<<48b8b86b3b981712185ed4bc2579f7de>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryShareBuildMutation$variables = {
  id: number;
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
    "cacheID": "3f08d5055607f4e945e85804cabfdcb0",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryShareBuildMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryShareBuildMutation(\n  $id: Int!\n) {\n  shareGearBuild(id: $id) {\n    ok\n    error\n    shareUrl\n  }\n}\n"
  }
};
})();

(node as any).hash = "f2bd14126048d0f3295c4882cd3a5314";

export default node;
