/**
 * @generated SignedSource<<7c4e488c8a785a6f0aae799db0e514a1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminPageVisibilityMutation$variables = {
  slug: string;
  v: boolean;
};
export type GuildAdminPageVisibilityMutation$data = {
  readonly updateGuildVisibility: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPageVisibilityMutation = {
  response: GuildAdminPageVisibilityMutation$data;
  variables: GuildAdminPageVisibilityMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "v"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "devOnly",
    "variableName": "v"
  },
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
    "name": "GuildAdminPageVisibilityMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildVisibility",
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
    "name": "GuildAdminPageVisibilityMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildVisibility",
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
    "cacheID": "c695855786d88f91c9d9e07b501d00c4",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPageVisibilityMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPageVisibilityMutation(\n  $slug: String!\n  $v: Boolean!\n) {\n  updateGuildVisibility(slug: $slug, devOnly: $v) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "db8d3075eb00f9d200db1e6bae1d0c02";

export default node;
