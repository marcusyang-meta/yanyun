/**
 * @generated SignedSource<<1db88bbc95e92a65bb8b141fe8625f52>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOfficerAddNoteMutation$variables = {
  body: string;
  memberDiscordId: string;
  slug: string;
};
export type GuildAdminOfficerAddNoteMutation$data = {
  readonly addGuildMemberNote: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminOfficerAddNoteMutation = {
  response: GuildAdminOfficerAddNoteMutation$data;
  variables: GuildAdminOfficerAddNoteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "body"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memberDiscordId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "body",
        "variableName": "body"
      },
      {
        "kind": "Variable",
        "name": "memberDiscordId",
        "variableName": "memberDiscordId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GuildMemberNotePayload",
    "kind": "LinkedField",
    "name": "addGuildMemberNote",
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
    "name": "GuildAdminOfficerAddNoteMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminOfficerAddNoteMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "64b47c6f0437939566954f6e95c34adc",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOfficerAddNoteMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminOfficerAddNoteMutation(\n  $slug: String!\n  $memberDiscordId: ID!\n  $body: String!\n) {\n  addGuildMemberNote(slug: $slug, memberDiscordId: $memberDiscordId, body: $body) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "6a8ffcc20ce93748ba005e987044cb4b";

export default node;
