/**
 * @generated SignedSource<<4dd254026791a9088ef4c5afca1b0311>>
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
export type documentsAddFixedTeamMemberAdminMutation$variables = {
  input: FixedTeamMemberInput;
  slug: string;
  teamId: string;
};
export type documentsAddFixedTeamMemberAdminMutation$data = {
  readonly addFixedTeamMember: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsAddFixedTeamMemberAdminMutation = {
  response: documentsAddFixedTeamMemberAdminMutation$data;
  variables: documentsAddFixedTeamMemberAdminMutation$variables;
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
    "name": "documentsAddFixedTeamMemberAdminMutation",
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
    "name": "documentsAddFixedTeamMemberAdminMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "8bc399a0d31602f8031e808a60268eec",
    "id": null,
    "metadata": {},
    "name": "documentsAddFixedTeamMemberAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsAddFixedTeamMemberAdminMutation(\n  $slug: String!\n  $teamId: ID!\n  $input: FixedTeamMemberInput!\n) {\n  addFixedTeamMember(slug: $slug, teamId: $teamId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c629f6814b61475e58d66e6850d2606b";

export default node;
