/**
 * @generated SignedSource<<3cca44bcdd1765a49ab26dbbaa176503>>
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
export type GuildAdminTeamsAddMemberMutation$variables = {
  input: FixedTeamMemberInput;
  slug: string;
  teamId: string;
};
export type GuildAdminTeamsAddMemberMutation$data = {
  readonly addFixedTeamMember: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminTeamsAddMemberMutation = {
  response: GuildAdminTeamsAddMemberMutation$data;
  variables: GuildAdminTeamsAddMemberMutation$variables;
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
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "teamId"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
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
    "concreteType": "GuildAdminPayload",
    "kind": "LinkedField",
    "name": "addFixedTeamMember",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      },
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminTeamsAddMemberMutation",
    "selections": (v3/*:: as any*/),
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
    "name": "GuildAdminTeamsAddMemberMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "6a55c0c38982a7e01b47a6f06f0f0e02",
    "id": null,
    "metadata": {},
    "name": "GuildAdminTeamsAddMemberMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminTeamsAddMemberMutation(\n  $slug: String!\n  $teamId: ID!\n  $input: FixedTeamMemberInput!\n) {\n  addFixedTeamMember(slug: $slug, teamId: $teamId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a4e52ed132c8845879b3749d8a713bbe";

export default node;
