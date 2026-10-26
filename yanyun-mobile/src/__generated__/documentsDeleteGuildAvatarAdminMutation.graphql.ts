/**
 * @generated SignedSource<<dd84a57832b2e9d5240a36228eaba472>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteGuildAvatarAdminMutation$variables = {
  slug: string;
};
export type documentsDeleteGuildAvatarAdminMutation$data = {
  readonly deleteGuildAvatar: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteGuildAvatarAdminMutation = {
  response: documentsDeleteGuildAvatarAdminMutation$data;
  variables: documentsDeleteGuildAvatarAdminMutation$variables;
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
    "name": "documentsDeleteGuildAvatarAdminMutation",
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
    "name": "documentsDeleteGuildAvatarAdminMutation",
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
    "cacheID": "86e3c1705590426566a7a993ee0e5c7e",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteGuildAvatarAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteGuildAvatarAdminMutation(\n  $slug: String!\n) {\n  deleteGuildAvatar(slug: $slug) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "75cf8f5110f466ad91f9ca817424f79b";

export default node;
