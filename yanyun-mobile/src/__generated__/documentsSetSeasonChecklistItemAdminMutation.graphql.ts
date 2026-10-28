/**
 * @generated SignedSource<<910c6d15b70ed51b4f30b44db6c38a12>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsSetSeasonChecklistItemAdminMutation$variables = {
  checked: boolean;
  itemKey: string;
  slug: string;
};
export type documentsSetSeasonChecklistItemAdminMutation$data = {
  readonly setSeasonChecklistItem: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsSetSeasonChecklistItemAdminMutation = {
  response: documentsSetSeasonChecklistItemAdminMutation$data;
  variables: documentsSetSeasonChecklistItemAdminMutation$variables;
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
    "name": "documentsSetSeasonChecklistItemAdminMutation",
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
    "name": "documentsSetSeasonChecklistItemAdminMutation",
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
    "cacheID": "8ab995c8cce814da803f9b29697e01f2",
    "id": null,
    "metadata": {},
    "name": "documentsSetSeasonChecklistItemAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsSetSeasonChecklistItemAdminMutation(\n  $slug: String!\n  $itemKey: String!\n  $checked: Boolean!\n) {\n  setSeasonChecklistItem(slug: $slug, itemKey: $itemKey, checked: $checked) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b0f58fc46f98f4998f8083ce7950d89e";

export default node;
