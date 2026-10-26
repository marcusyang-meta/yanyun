/**
 * @generated SignedSource<<5edaeb6423498d40d5009c57d8597449>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateGuildProfileInput = {
  announcement?: string | null | undefined;
  bgImageUrl?: string | null | undefined;
  logoUrl?: string | null | undefined;
  masterName?: string | null | undefined;
  name?: string | null | undefined;
  slogan?: string | null | undefined;
};
export type GuildAdminPageProfileMutation$variables = {
  input: UpdateGuildProfileInput;
  slug: string;
};
export type GuildAdminPageProfileMutation$data = {
  readonly updateGuildProfile: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPageProfileMutation = {
  response: GuildAdminPageProfileMutation$data;
  variables: GuildAdminPageProfileMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
    "name": "GuildAdminPageProfileMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildProfile",
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
    "name": "GuildAdminPageProfileMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildProfile",
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
    "cacheID": "4bc55e406fe1439a46de150ab9e56791",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPageProfileMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPageProfileMutation(\n  $slug: String!\n  $input: UpdateGuildProfileInput!\n) {\n  updateGuildProfile(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ef09497270e6d9f803a0bbb64eb8d7b6";

export default node;
