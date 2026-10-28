/**
 * @generated SignedSource<<d718d14fc06426c4c031a276fb9b2098>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsSetGuildMentorAdminMutation$variables = {
  discordId: string;
  isMentor: boolean;
  slug: string;
};
export type documentsSetGuildMentorAdminMutation$data = {
  readonly setGuildMentor: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsSetGuildMentorAdminMutation = {
  response: documentsSetGuildMentorAdminMutation$data;
  variables: documentsSetGuildMentorAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "discordId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isMentor"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "discordId",
    "variableName": "discordId"
  },
  {
    "kind": "Variable",
    "name": "isMentor",
    "variableName": "isMentor"
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
    "name": "documentsSetGuildMentorAdminMutation",
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
      (v2/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsSetGuildMentorAdminMutation",
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
    "cacheID": "58e6fee0568ee779c92b12f686fcc4b3",
    "id": null,
    "metadata": {},
    "name": "documentsSetGuildMentorAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsSetGuildMentorAdminMutation(\n  $slug: String!\n  $discordId: String!\n  $isMentor: Boolean!\n) {\n  setGuildMentor(slug: $slug, discordId: $discordId, isMentor: $isMentor) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "9289e42c6b88c6267afee900b501a6f8";

export default node;
