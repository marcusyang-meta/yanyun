/**
 * @generated SignedSource<<816d5cdaf91d2ba031a7a93394e18bb9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RosterImportRowStatus = "MATCHED" | "NEW" | "UNRECOGNIZED" | "%future added value";
export type GuildAdminSeasonPreviewMutation$variables = {
  imageCount: number;
  lines: ReadonlyArray<string>;
  slug: string;
};
export type GuildAdminSeasonPreviewMutation$data = {
  readonly previewRosterImport: {
    readonly error: string | null | undefined;
    readonly importedCount: number | null | undefined;
    readonly message: string | null | undefined;
    readonly ok: boolean;
    readonly preview: {
      readonly batchId: string;
      readonly matchedCount: number;
      readonly newCount: number;
      readonly rows: ReadonlyArray<{
        readonly id: string;
        readonly importable: boolean;
        readonly matchedName: string;
        readonly rawName: string;
        readonly status: RosterImportRowStatus;
        readonly statusLabel: string;
      }>;
      readonly unrecognizedCount: number;
    } | null | undefined;
  };
};
export type GuildAdminSeasonPreviewMutation = {
  response: GuildAdminSeasonPreviewMutation$data;
  variables: GuildAdminSeasonPreviewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "imageCount"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "lines"
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
        "name": "imageCount",
        "variableName": "imageCount"
      },
      {
        "kind": "Variable",
        "name": "lines",
        "variableName": "lines"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "RosterImportPayload",
    "kind": "LinkedField",
    "name": "previewRosterImport",
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "RosterImportPreview",
        "kind": "LinkedField",
        "name": "preview",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "batchId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "matchedCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "newCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "unrecognizedCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "RosterImportRow",
            "kind": "LinkedField",
            "name": "rows",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rawName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "status",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "statusLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "matchedName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "importable",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
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
    "name": "GuildAdminSeasonPreviewMutation",
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
    "name": "GuildAdminSeasonPreviewMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "05f7efe83a69b8e4c3b70f46a8c4d97e",
    "id": null,
    "metadata": {},
    "name": "GuildAdminSeasonPreviewMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminSeasonPreviewMutation(\n  $slug: String!\n  $lines: [String!]!\n  $imageCount: Int!\n) {\n  previewRosterImport(slug: $slug, lines: $lines, imageCount: $imageCount) {\n    ok\n    error\n    importedCount\n    message\n    preview {\n      batchId\n      matchedCount\n      newCount\n      unrecognizedCount\n      rows {\n        id\n        rawName\n        status\n        statusLabel\n        matchedName\n        importable\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6a737db4ab1622e8d16ddf5d9998ea68";

export default node;
