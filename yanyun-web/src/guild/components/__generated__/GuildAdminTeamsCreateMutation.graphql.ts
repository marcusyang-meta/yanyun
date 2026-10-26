/**
 * @generated SignedSource<<8b3eac6c36831623436d24711741be6d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateFixedTeamInput = {
  description?: string | null | undefined;
  name: string;
};
export type GuildAdminTeamsCreateMutation$variables = {
  input: CreateFixedTeamInput;
  slug: string;
};
export type GuildAdminTeamsCreateMutation$data = {
  readonly createFixedTeam: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminTeamsCreateMutation = {
  response: GuildAdminTeamsCreateMutation$data;
  variables: GuildAdminTeamsCreateMutation$variables;
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
v2 = [
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
      }
    ],
    "concreteType": "GuildAdminPayload",
    "kind": "LinkedField",
    "name": "createFixedTeam",
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
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminTeamsCreateMutation",
    "selections": (v2/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminTeamsCreateMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "08b5791ec18b01dfbe592794b02981b1",
    "id": null,
    "metadata": {},
    "name": "GuildAdminTeamsCreateMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminTeamsCreateMutation(\n  $slug: String!\n  $input: CreateFixedTeamInput!\n) {\n  createFixedTeam(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "d1b8eff566d48f3d539f97768b261106";

export default node;
