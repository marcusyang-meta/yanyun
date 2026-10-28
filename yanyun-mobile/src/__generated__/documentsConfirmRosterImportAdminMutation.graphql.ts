/**
 * @generated SignedSource<<9a91dae7cfe295898e8c8d6bc78892da>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsConfirmRosterImportAdminMutation$variables = {
  batchId: string;
  rowIds: ReadonlyArray<string>;
  slug: string;
};
export type documentsConfirmRosterImportAdminMutation$data = {
  readonly confirmRosterImport: {
    readonly error: string | null | undefined;
    readonly importedCount: number | null | undefined;
    readonly message: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsConfirmRosterImportAdminMutation = {
  response: documentsConfirmRosterImportAdminMutation$data;
  variables: documentsConfirmRosterImportAdminMutation$variables;
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
    "name": "documentsConfirmRosterImportAdminMutation",
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
    "name": "documentsConfirmRosterImportAdminMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "8c72c5c1a26b431b55eb1b8cc12e672d",
    "id": null,
    "metadata": {},
    "name": "documentsConfirmRosterImportAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsConfirmRosterImportAdminMutation(\n  $slug: String!\n  $batchId: ID!\n  $rowIds: [ID!]!\n) {\n  confirmRosterImport(slug: $slug, batchId: $batchId, rowIds: $rowIds) {\n    ok\n    error\n    importedCount\n    message\n  }\n}\n"
  }
};
})();

(node as any).hash = "f3758c7b4402be6ca24732ab32875d22";

export default node;
