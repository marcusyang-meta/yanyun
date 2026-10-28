/**
 * @generated SignedSource<<7462a99253b3e3f6b557ce3d4e3e769a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOfficerUpdateNoteMutation$variables = {
  body: string;
  noteId: string;
  slug: string;
};
export type GuildAdminOfficerUpdateNoteMutation$data = {
  readonly updateGuildMemberNote: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminOfficerUpdateNoteMutation = {
  response: GuildAdminOfficerUpdateNoteMutation$data;
  variables: GuildAdminOfficerUpdateNoteMutation$variables;
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
  "name": "noteId"
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
        "name": "noteId",
        "variableName": "noteId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GuildMemberNotePayload",
    "kind": "LinkedField",
    "name": "updateGuildMemberNote",
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
    "name": "GuildAdminOfficerUpdateNoteMutation",
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
    "name": "GuildAdminOfficerUpdateNoteMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "69f2de2bd5c0fa6217837411ebc8ffc6",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOfficerUpdateNoteMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminOfficerUpdateNoteMutation(\n  $slug: String!\n  $noteId: ID!\n  $body: String!\n) {\n  updateGuildMemberNote(slug: $slug, noteId: $noteId, body: $body) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "12b7268a8967c9e5b4e5eb4f7154b647";

export default node;
