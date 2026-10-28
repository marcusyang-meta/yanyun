/**
 * @generated SignedSource<<b36a7b28ec0a9dd373165008d51ce4b3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminInsightsDeleteStandardMutation$variables = {
  id: string;
  slug: string;
};
export type GuildAdminInsightsDeleteStandardMutation$data = {
  readonly deleteGearStandard: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminInsightsDeleteStandardMutation = {
  response: GuildAdminInsightsDeleteStandardMutation$data;
  variables: GuildAdminInsightsDeleteStandardMutation$variables;
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
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GearStandardPayload",
    "kind": "LinkedField",
    "name": "deleteGearStandard",
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
    "name": "GuildAdminInsightsDeleteStandardMutation",
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
    "name": "GuildAdminInsightsDeleteStandardMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "2170124535051cbfd7ef06a363f13111",
    "id": null,
    "metadata": {},
    "name": "GuildAdminInsightsDeleteStandardMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminInsightsDeleteStandardMutation(\n  $slug: String!\n  $id: ID!\n) {\n  deleteGearStandard(slug: $slug, id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "115b271e7d7dbad576a68605b35a897d";

export default node;
