/**
 * @generated SignedSource<<91dba87df7245ab0705a6021316f8072>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminTeamsDeleteMutation$variables = {
  slug: string;
  teamId: string;
};
export type GuildAdminTeamsDeleteMutation$data = {
  readonly deleteFixedTeam: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminTeamsDeleteMutation = {
  response: GuildAdminTeamsDeleteMutation$data;
  variables: GuildAdminTeamsDeleteMutation$variables;
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
    "name": "teamId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  },
  {
    "kind": "Variable",
    "name": "teamId",
    "variableName": "teamId"
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
    "name": "GuildAdminTeamsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteFixedTeam",
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
    "name": "GuildAdminTeamsDeleteMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteFixedTeam",
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
    "cacheID": "4c61d8dc1ffbf0d0b96cc1f36ed9ccb6",
    "id": null,
    "metadata": {},
    "name": "GuildAdminTeamsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminTeamsDeleteMutation(\n  $slug: String!\n  $teamId: ID!\n) {\n  deleteFixedTeam(slug: $slug, teamId: $teamId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c29a05b69b1b49e3917342f6d09428b2";

export default node;
