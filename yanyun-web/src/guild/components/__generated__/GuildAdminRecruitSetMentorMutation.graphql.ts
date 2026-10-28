/**
 * @generated SignedSource<<7b6fff0072a3ac72edcd0e785e97756d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminRecruitSetMentorMutation$variables = {
  id: string;
  slug: string;
  v: boolean;
};
export type GuildAdminRecruitSetMentorMutation$data = {
  readonly setGuildMentor: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminRecruitSetMentorMutation = {
  response: GuildAdminRecruitSetMentorMutation$data;
  variables: GuildAdminRecruitSetMentorMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "v"
},
v3 = [
  {
    "kind": "Variable",
    "name": "discordId",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "isMentor",
    "variableName": "v"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
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
    "name": "GuildAdminRecruitSetMentorMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "setGuildMentor",
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
      (v0/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminRecruitSetMentorMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "setGuildMentor",
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
    "cacheID": "fd398a282fb720ef9edebe2bb5338f48",
    "id": null,
    "metadata": {},
    "name": "GuildAdminRecruitSetMentorMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminRecruitSetMentorMutation(\n  $slug: String!\n  $id: String!\n  $v: Boolean!\n) {\n  setGuildMentor(slug: $slug, discordId: $id, isMentor: $v) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c54863c3416bb842565eb05be16be0c1";

export default node;
