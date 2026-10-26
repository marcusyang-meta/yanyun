/**
 * @generated SignedSource<<2277e4594c43bf194085fdcd7b415e4c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateFixedTeamInput = {
  description?: string | null | undefined;
  name?: string | null | undefined;
};
export type GuildAdminTeamsUpdateMutation$variables = {
  input: UpdateFixedTeamInput;
  slug: string;
  teamId: string;
};
export type GuildAdminTeamsUpdateMutation$data = {
  readonly updateFixedTeam: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminTeamsUpdateMutation = {
  response: GuildAdminTeamsUpdateMutation$data;
  variables: GuildAdminTeamsUpdateMutation$variables;
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
    "name": "GuildAdminTeamsUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateFixedTeam",
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
    "name": "GuildAdminTeamsUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateFixedTeam",
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
    "cacheID": "5dd5762d8a1491aac35e57e179448c83",
    "id": null,
    "metadata": {},
    "name": "GuildAdminTeamsUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminTeamsUpdateMutation(\n  $slug: String!\n  $teamId: ID!\n  $input: UpdateFixedTeamInput!\n) {\n  updateFixedTeam(slug: $slug, teamId: $teamId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "fd2df1f25b6dcd9d388079c589380e66";

export default node;
