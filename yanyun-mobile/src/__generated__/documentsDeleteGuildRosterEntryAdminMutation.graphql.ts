/**
 * @generated SignedSource<<090aab36f19621f769c5a6375131f540>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteGuildRosterEntryAdminMutation$variables = {
  entryId: string;
  slug: string;
};
export type documentsDeleteGuildRosterEntryAdminMutation$data = {
  readonly deleteGuildRosterEntry: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteGuildRosterEntryAdminMutation = {
  response: documentsDeleteGuildRosterEntryAdminMutation$data;
  variables: documentsDeleteGuildRosterEntryAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "entryId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "entryId",
    "variableName": "entryId"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v4 = {
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
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsDeleteGuildRosterEntryAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteGuildRosterEntry",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/)
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
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsDeleteGuildRosterEntryAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteGuildRosterEntry",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
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
    "cacheID": "8d62de7cf940bd1891e0282032492bec",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteGuildRosterEntryAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteGuildRosterEntryAdminMutation(\n  $slug: String!\n  $entryId: ID!\n) {\n  deleteGuildRosterEntry(slug: $slug, entryId: $entryId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6f0fa537f21d258f571fa59969404f36";

export default node;
