/**
 * @generated SignedSource<<a7dc11a12f7a08b3b4da7afdae4ee439>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminSeasonSetItemMutation$variables = {
  checked: boolean;
  itemKey: string;
  slug: string;
};
export type GuildAdminSeasonSetItemMutation$data = {
  readonly setSeasonChecklistItem: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminSeasonSetItemMutation = {
  response: GuildAdminSeasonSetItemMutation$data;
  variables: GuildAdminSeasonSetItemMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "checked"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "itemKey"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "checked",
    "variableName": "checked"
  },
  {
    "kind": "Variable",
    "name": "itemKey",
    "variableName": "itemKey"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v5 = {
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
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminSeasonSetItemMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "setSeasonChecklistItem",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/)
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
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminSeasonSetItemMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "setSeasonChecklistItem",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
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
    "cacheID": "ceabc53f13562b76b1b67e34d91def22",
    "id": null,
    "metadata": {},
    "name": "GuildAdminSeasonSetItemMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminSeasonSetItemMutation(\n  $slug: String!\n  $itemKey: String!\n  $checked: Boolean!\n) {\n  setSeasonChecklistItem(slug: $slug, itemKey: $itemKey, checked: $checked) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "dd983a0564c71eebf60a66cde0798389";

export default node;
