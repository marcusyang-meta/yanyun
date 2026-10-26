/**
 * @generated SignedSource<<2d7dd720844c3432d3d36e79b81afb44>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsSetGuildAvatarAdminMutation$variables = {
  dataBase64: string;
  slug: string;
};
export type documentsSetGuildAvatarAdminMutation$data = {
  readonly setGuildAvatar: {
    readonly avatarUrl: string | null | undefined;
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsSetGuildAvatarAdminMutation = {
  response: documentsSetGuildAvatarAdminMutation$data;
  variables: documentsSetGuildAvatarAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "dataBase64"
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
    "variableName": "dataBase64"
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
    "name": "documentsSetGuildAvatarAdminMutation",
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
    "name": "documentsSetGuildAvatarAdminMutation",
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
    "cacheID": "54f86f300ed30eee82b664729973fe14",
    "id": null,
    "metadata": {},
    "name": "documentsSetGuildAvatarAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsSetGuildAvatarAdminMutation(\n  $slug: String!\n  $dataBase64: String!\n) {\n  setGuildAvatar(slug: $slug, dataBase64: $dataBase64) {\n    ok\n    error\n    avatarUrl\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b955344df4bd7ffa4bb75a24087a343d";

export default node;
