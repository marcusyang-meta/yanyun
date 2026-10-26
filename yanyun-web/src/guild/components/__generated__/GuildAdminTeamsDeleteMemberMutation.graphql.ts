/**
 * @generated SignedSource<<1a63d9c2127b49de1b7e2124eda63ba9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminTeamsDeleteMemberMutation$variables = {
  memberId: string;
  slug: string;
  teamId: string;
};
export type GuildAdminTeamsDeleteMemberMutation$data = {
  readonly deleteFixedTeamMember: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminTeamsDeleteMemberMutation = {
  response: GuildAdminTeamsDeleteMemberMutation$data;
  variables: GuildAdminTeamsDeleteMemberMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memberId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "teamId"
},
v3 = [
  {
    "kind": "Variable",
    "name": "memberId",
    "variableName": "memberId"
  },
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v5 = {
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
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminTeamsDeleteMemberMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteFixedTeamMember",
        "plural": false,
        "selections": [
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
      (v2/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminTeamsDeleteMemberMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteFixedTeamMember",
        "plural": false,
        "selections": [
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
    "cacheID": "3d36b56ecaa0a71586b8375871536517",
    "id": null,
    "metadata": {},
    "name": "GuildAdminTeamsDeleteMemberMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminTeamsDeleteMemberMutation(\n  $slug: String!\n  $teamId: ID!\n  $memberId: ID!\n) {\n  deleteFixedTeamMember(slug: $slug, teamId: $teamId, memberId: $memberId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e4c86d0f1988f1e73df1309e589853b6";

export default node;
