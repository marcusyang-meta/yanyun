/**
 * @generated SignedSource<<491e3a119d7c3be084d921b3a7bd034b>>
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
export type GuildAdminTeamsUpdateMemberMutation$variables = {
  input: FixedTeamMemberInput;
  memberId: string;
  slug: string;
  teamId: string;
};
export type GuildAdminTeamsUpdateMemberMutation$data = {
  readonly updateFixedTeamMember: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminTeamsUpdateMemberMutation = {
  response: GuildAdminTeamsUpdateMemberMutation$data;
  variables: GuildAdminTeamsUpdateMemberMutation$variables;
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
    "name": "GuildAdminTeamsUpdateMemberMutation",
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
    "name": "GuildAdminTeamsUpdateMemberMutation",
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
    "cacheID": "9bcfabd7859cb0d8615055f122c31185",
    "id": null,
    "metadata": {},
    "name": "GuildAdminTeamsUpdateMemberMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminTeamsUpdateMemberMutation(\n  $slug: String!\n  $teamId: ID!\n  $memberId: ID!\n  $input: FixedTeamMemberInput!\n) {\n  updateFixedTeamMember(slug: $slug, teamId: $teamId, memberId: $memberId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "01417087d4c1c2c45382a658cfaf094d";

export default node;
