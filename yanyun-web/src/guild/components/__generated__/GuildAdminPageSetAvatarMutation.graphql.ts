/**
 * @generated SignedSource<<ae03cc91d0ad930eceb7ff9219c92667>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminPageSetAvatarMutation$variables = {
  d: string;
  slug: string;
};
export type GuildAdminPageSetAvatarMutation$data = {
  readonly setGuildAvatar: {
    readonly avatarUrl: string | null | undefined;
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPageSetAvatarMutation = {
  response: GuildAdminPageSetAvatarMutation$data;
  variables: GuildAdminPageSetAvatarMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "d"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "dataBase64",
    "variableName": "d"
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
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
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
    "name": "GuildAdminPageSetAvatarMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "setGuildAvatar",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/)
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
    "name": "GuildAdminPageSetAvatarMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "setGuildAvatar",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
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
    "cacheID": "14646d6004203e37d6e17c2f1ed9f9b5",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPageSetAvatarMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPageSetAvatarMutation(\n  $slug: String!\n  $d: String!\n) {\n  setGuildAvatar(slug: $slug, dataBase64: $d) {\n    ok\n    error\n    avatarUrl\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c74f5ffeeb83a9219f91028c87a7bd8d";

export default node;
