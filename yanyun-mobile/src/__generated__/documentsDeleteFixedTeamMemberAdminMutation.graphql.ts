/**
 * @generated SignedSource<<27aed8c6d58751e65e9cc9318f0bd1ca>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteFixedTeamMemberAdminMutation$variables = {
  memberId: string;
  slug: string;
  teamId: string;
};
export type documentsDeleteFixedTeamMemberAdminMutation$data = {
  readonly deleteFixedTeamMember: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteFixedTeamMemberAdminMutation = {
  response: documentsDeleteFixedTeamMemberAdminMutation$data;
  variables: documentsDeleteFixedTeamMemberAdminMutation$variables;
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
    "name": "documentsDeleteFixedTeamMemberAdminMutation",
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
    "name": "documentsDeleteFixedTeamMemberAdminMutation",
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
    "cacheID": "867c108aecc6f67a65d758fb557babad",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteFixedTeamMemberAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteFixedTeamMemberAdminMutation(\n  $slug: String!\n  $teamId: ID!\n  $memberId: ID!\n) {\n  deleteFixedTeamMember(slug: $slug, teamId: $teamId, memberId: $memberId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "d15397a20883169793e4ff8945992e65";

export default node;
