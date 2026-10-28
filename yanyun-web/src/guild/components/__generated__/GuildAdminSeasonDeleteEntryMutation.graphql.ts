/**
 * @generated SignedSource<<d673e9892026bd772a1f23f0fc73be0a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminSeasonDeleteEntryMutation$variables = {
  entryId: string;
  slug: string;
};
export type GuildAdminSeasonDeleteEntryMutation$data = {
  readonly deleteGuildRosterEntry: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminSeasonDeleteEntryMutation = {
  response: GuildAdminSeasonDeleteEntryMutation$data;
  variables: GuildAdminSeasonDeleteEntryMutation$variables;
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
    "name": "GuildAdminSeasonDeleteEntryMutation",
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
    "name": "GuildAdminSeasonDeleteEntryMutation",
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
    "cacheID": "e1e0ce791eae084380001dfc89ed91c0",
    "id": null,
    "metadata": {},
    "name": "GuildAdminSeasonDeleteEntryMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminSeasonDeleteEntryMutation(\n  $slug: String!\n  $entryId: ID!\n) {\n  deleteGuildRosterEntry(slug: $slug, entryId: $entryId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e0a0925bb6f8704976768318f59f0755";

export default node;
