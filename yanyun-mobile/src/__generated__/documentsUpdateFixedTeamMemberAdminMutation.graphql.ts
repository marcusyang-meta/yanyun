/**
 * @generated SignedSource<<f1d04853ee5415afabf569e90be50e1a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FixedTeamMemberInput = {
  nickname: string;
  note?: string | null | undefined;
  sortOrder?: number | null | undefined;
  weapon?: string | null | undefined;
};
export type documentsUpdateFixedTeamMemberAdminMutation$variables = {
  input: FixedTeamMemberInput;
  memberId: string;
  slug: string;
  teamId: string;
};
export type documentsUpdateFixedTeamMemberAdminMutation$data = {
  readonly updateFixedTeamMember: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateFixedTeamMemberAdminMutation = {
  response: documentsUpdateFixedTeamMemberAdminMutation$data;
  variables: documentsUpdateFixedTeamMemberAdminMutation$variables;
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
  "name": "memberId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "teamId"
},
v4 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  },
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v6 = {
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
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsUpdateFixedTeamMemberAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateFixedTeamMember",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          (v6/*:: as any*/)
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
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsUpdateFixedTeamMemberAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateFixedTeamMember",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          (v6/*:: as any*/),
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
    "cacheID": "b3e2cd7cbdac4abe2b87598294284a84",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateFixedTeamMemberAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateFixedTeamMemberAdminMutation(\n  $slug: String!\n  $teamId: ID!\n  $memberId: ID!\n  $input: FixedTeamMemberInput!\n) {\n  updateFixedTeamMember(slug: $slug, teamId: $teamId, memberId: $memberId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6bb2692e230646b0fd97649f2d9ef993";

export default node;
