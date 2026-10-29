/**
 * @generated SignedSource<<55796758265e67006657745622d9ba86>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryShareBuildMutation$variables = {
  id: string;
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
    "cacheID": "9b3b9429eabda84e57a626053894353d",
    "id": null,
    "metadata": {},
    "name": "GearLibraryShareBuildMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryShareBuildMutation(\n  $id: ID!\n) {\n  shareGearBuild(id: $id) {\n    ok\n    error\n    shareUrl\n  }\n}\n"
  }
};
})();

(node as any).hash = "29020b6095b2ed29770b05fc5f8adb5a";

export default node;
