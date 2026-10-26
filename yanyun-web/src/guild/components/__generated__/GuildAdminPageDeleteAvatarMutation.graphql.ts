/**
 * @generated SignedSource<<a36e5b8615f3e721a650c91eec30d673>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminPageDeleteAvatarMutation$variables = {
  slug: string;
};
export type GuildAdminPageDeleteAvatarMutation$data = {
  readonly deleteGuildAvatar: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPageDeleteAvatarMutation = {
  response: GuildAdminPageDeleteAvatarMutation$data;
  variables: GuildAdminPageDeleteAvatarMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminPageDeleteAvatarMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteGuildAvatar",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildAdminPageDeleteAvatarMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteGuildAvatar",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
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
    "cacheID": "22822a23d527df72e079f86005911029",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPageDeleteAvatarMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPageDeleteAvatarMutation(\n  $slug: String!\n) {\n  deleteGuildAvatar(slug: $slug) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b8f8eacdda8a493415eb93cf142f1768";

export default node;
