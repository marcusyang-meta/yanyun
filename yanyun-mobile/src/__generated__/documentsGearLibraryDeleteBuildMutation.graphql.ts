/**
 * @generated SignedSource<<60ffa337fb428d4895fb801dcc9aa67e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryDeleteBuildMutation$variables = {
  id: number;
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
    "cacheID": "4f785b94c7fd3e37f41da478b8acc0bf",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryDeleteBuildMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryDeleteBuildMutation(\n  $id: Int!\n) {\n  deleteGearBuild(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "624285cdf88f86a72d3bcb075bb34ccf";

export default node;
