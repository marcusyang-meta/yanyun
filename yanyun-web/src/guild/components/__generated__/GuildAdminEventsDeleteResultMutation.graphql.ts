/**
 * @generated SignedSource<<77c74c5fae05c60de2e2b7dcb15e9f23>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminEventsDeleteResultMutation$variables = {
  resultId: string;
  slug: string;
};
export type GuildAdminEventsDeleteResultMutation$data = {
  readonly deleteEventResult: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminEventsDeleteResultMutation = {
  response: GuildAdminEventsDeleteResultMutation$data;
  variables: GuildAdminEventsDeleteResultMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resultId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "resultId",
    "variableName": "resultId"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminEventsDeleteResultMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteEventResult",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminEventsDeleteResultMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteEventResult",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "fbe6e693e09b0b1a3b2cf1504b9d7a30",
    "id": null,
    "metadata": {},
    "name": "GuildAdminEventsDeleteResultMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminEventsDeleteResultMutation(\n  $slug: String!\n  $resultId: ID!\n) {\n  deleteEventResult(slug: $slug, resultId: $resultId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8e69a25162933b609319c0f1e5de60f8";

export default node;
