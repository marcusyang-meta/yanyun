/**
 * @generated SignedSource<<ab3a032d82e486e33ff726de812ccd12>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUpdateGuildVisibilityAdminMutation$variables = {
  devOnly: boolean;
  slug: string;
};
export type documentsUpdateGuildVisibilityAdminMutation$data = {
  readonly updateGuildVisibility: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateGuildVisibilityAdminMutation = {
  response: documentsUpdateGuildVisibilityAdminMutation$data;
  variables: documentsUpdateGuildVisibilityAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "devOnly"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "devOnly",
    "variableName": "devOnly"
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
    "name": "documentsUpdateGuildVisibilityAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildVisibility",
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
    "name": "documentsUpdateGuildVisibilityAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildVisibility",
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
    "cacheID": "04404cb3e4460c45d35073c0011d827a",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGuildVisibilityAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGuildVisibilityAdminMutation(\n  $slug: String!\n  $devOnly: Boolean!\n) {\n  updateGuildVisibility(slug: $slug, devOnly: $devOnly) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "22011142d8f445e76e068415dee777ad";

export default node;
