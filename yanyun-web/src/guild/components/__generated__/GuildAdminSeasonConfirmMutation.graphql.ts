/**
 * @generated SignedSource<<022dd3dcd670114bb05614545af19ba1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminSeasonConfirmMutation$variables = {
  batchId: string;
  rowIds: ReadonlyArray<string>;
  slug: string;
};
export type GuildAdminSeasonConfirmMutation$data = {
  readonly confirmRosterImport: {
    readonly error: string | null | undefined;
    readonly importedCount: number | null | undefined;
    readonly message: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminSeasonConfirmMutation = {
  response: GuildAdminSeasonConfirmMutation$data;
  variables: GuildAdminSeasonConfirmMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "batchId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "rowIds"
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
        "name": "batchId",
        "variableName": "batchId"
      },
      {
        "kind": "Variable",
        "name": "rowIds",
        "variableName": "rowIds"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "RosterImportPayload",
    "kind": "LinkedField",
    "name": "confirmRosterImport",
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
        "name": "importedCount",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "message",
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
    "name": "GuildAdminSeasonConfirmMutation",
    "selections": (v3/*:: as any*/),
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
    "name": "GuildAdminSeasonConfirmMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "af734a8ebe3773db8541aa13ad15c1c0",
    "id": null,
    "metadata": {},
    "name": "GuildAdminSeasonConfirmMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminSeasonConfirmMutation(\n  $slug: String!\n  $batchId: ID!\n  $rowIds: [ID!]!\n) {\n  confirmRosterImport(slug: $slug, batchId: $batchId, rowIds: $rowIds) {\n    ok\n    error\n    importedCount\n    message\n  }\n}\n"
  }
};
})();

(node as any).hash = "32b49c8ec1460ac747871aff5703706e";

export default node;
