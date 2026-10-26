/**
 * @generated SignedSource<<19299842eb1fd2b8b07f27a97bedb976>>
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
export type documentsUpdateFixedTeamAdminMutation$variables = {
  input: UpdateFixedTeamInput;
  slug: string;
  teamId: string;
};
export type documentsUpdateFixedTeamAdminMutation$data = {
  readonly updateFixedTeam: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateFixedTeamAdminMutation = {
  response: documentsUpdateFixedTeamAdminMutation$data;
  variables: documentsUpdateFixedTeamAdminMutation$variables;
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
    "name": "documentsUpdateFixedTeamAdminMutation",
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
    "name": "documentsUpdateFixedTeamAdminMutation",
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
    "cacheID": "a89d218d44078ec9f9d0504afc9fa3e8",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateFixedTeamAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateFixedTeamAdminMutation(\n  $slug: String!\n  $teamId: ID!\n  $input: UpdateFixedTeamInput!\n) {\n  updateFixedTeam(slug: $slug, teamId: $teamId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "78537d8f9c36b9c6dc6dbc7c27192a86";

export default node;
