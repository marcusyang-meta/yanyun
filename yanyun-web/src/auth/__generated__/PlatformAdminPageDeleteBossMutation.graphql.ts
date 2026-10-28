/**
 * @generated SignedSource<<303eb8ddfaeafe9292f77eb907119dc1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageDeleteBossMutation$variables = {
  id: number;
};
export type PlatformAdminPageDeleteBossMutation$data = {
  readonly platformAdminDeleteBoss: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageDeleteBossMutation = {
  response: PlatformAdminPageDeleteBossMutation$data;
  variables: PlatformAdminPageDeleteBossMutation$variables;
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
    "concreteType": "PlatformAdminPayload",
    "kind": "LinkedField",
    "name": "platformAdminDeleteBoss",
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
        "name": "errorCode",
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
    "name": "PlatformAdminPageDeleteBossMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageDeleteBossMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "b08c5b9ef38437be41d07fd4f18ad2cc",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageDeleteBossMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageDeleteBossMutation(\n  $id: Int!\n) {\n  platformAdminDeleteBoss(id: $id) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "4689217237b1674c2119d0f62bd021ef";

export default node;
