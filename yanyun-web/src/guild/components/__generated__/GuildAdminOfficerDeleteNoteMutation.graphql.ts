/**
 * @generated SignedSource<<ff1594e72b5bebc669e5aa0c648d4525>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOfficerDeleteNoteMutation$variables = {
  noteId: string;
  slug: string;
};
export type GuildAdminOfficerDeleteNoteMutation$data = {
  readonly deleteGuildMemberNote: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminOfficerDeleteNoteMutation = {
  response: GuildAdminOfficerDeleteNoteMutation$data;
  variables: GuildAdminOfficerDeleteNoteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "noteId"
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
    "name": "deleteGuildMemberNote",
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
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminOfficerDeleteNoteMutation",
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
    "name": "GuildAdminOfficerDeleteNoteMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "3d06136a8817b2b1e089d49397af1145",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOfficerDeleteNoteMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminOfficerDeleteNoteMutation(\n  $slug: String!\n  $noteId: ID!\n) {\n  deleteGuildMemberNote(slug: $slug, noteId: $noteId) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "d9f7794d00f3a393f337e6b9df48fa51";

export default node;
