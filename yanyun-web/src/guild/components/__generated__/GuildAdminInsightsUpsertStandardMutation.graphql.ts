/**
 * @generated SignedSource<<6aff4318e8aa5465184263eca4c0b5bb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminInsightsUpsertStandardMutation$variables = {
  id?: string | null | undefined;
  label: string;
  minScore: number;
  slug: string;
};
export type GuildAdminInsightsUpsertStandardMutation$data = {
  readonly upsertGearStandard: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminInsightsUpsertStandardMutation = {
  response: GuildAdminInsightsUpsertStandardMutation$data;
  variables: GuildAdminInsightsUpsertStandardMutation$variables;
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
  "name": "label"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "minScore"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v4 = [
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
        "name": "label",
        "variableName": "label"
      },
      {
        "kind": "Variable",
        "name": "minScore",
        "variableName": "minScore"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GearStandardPayload",
    "kind": "LinkedField",
    "name": "upsertGearStandard",
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
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminInsightsUpsertStandardMutation",
    "selections": (v4/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminInsightsUpsertStandardMutation",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "f8acc8e3badbd717e53f1ee2778c6d82",
    "id": null,
    "metadata": {},
    "name": "GuildAdminInsightsUpsertStandardMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminInsightsUpsertStandardMutation(\n  $slug: String!\n  $id: ID\n  $label: String!\n  $minScore: Int!\n) {\n  upsertGearStandard(slug: $slug, id: $id, label: $label, minScore: $minScore) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "9cbb03012914682633fb3c3e58f9dbee";

export default node;
