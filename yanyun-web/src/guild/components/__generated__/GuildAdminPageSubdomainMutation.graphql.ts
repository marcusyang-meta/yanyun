/**
 * @generated SignedSource<<ce5d9c0b4f2c15a0767a2929652f162b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminPageSubdomainMutation$variables = {
  enabled: boolean;
  slug: string;
};
export type GuildAdminPageSubdomainMutation$data = {
  readonly updateGuildSubdomain: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPageSubdomainMutation = {
  response: GuildAdminPageSubdomainMutation$data;
  variables: GuildAdminPageSubdomainMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enabled"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "enabled",
    "variableName": "enabled"
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
    "name": "GuildAdminPageSubdomainMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildSubdomain",
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
    "name": "GuildAdminPageSubdomainMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildSubdomain",
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
    "cacheID": "5bc98cc2e30dcb52300d4f1d1da8182a",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPageSubdomainMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPageSubdomainMutation(\n  $slug: String!\n  $enabled: Boolean!\n) {\n  updateGuildSubdomain(slug: $slug, enabled: $enabled) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c95a0f3fed804a816f8f876435f09acd";

export default node;
