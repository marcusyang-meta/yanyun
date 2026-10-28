/**
 * @generated SignedSource<<9f11696ececff7e65bc1cc15b8bb05c1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsBindGuildCustomDomainAdminMutation$variables = {
  hostname: string;
  slug: string;
};
export type documentsBindGuildCustomDomainAdminMutation$data = {
  readonly bindGuildCustomDomain: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsBindGuildCustomDomainAdminMutation = {
  response: documentsBindGuildCustomDomainAdminMutation$data;
  variables: documentsBindGuildCustomDomainAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "hostname"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "hostname",
    "variableName": "hostname"
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
    "name": "documentsBindGuildCustomDomainAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "bindGuildCustomDomain",
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
    "name": "documentsBindGuildCustomDomainAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "bindGuildCustomDomain",
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
    "cacheID": "9070258d5f43d3f047e4d30f2712da0f",
    "id": null,
    "metadata": {},
    "name": "documentsBindGuildCustomDomainAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsBindGuildCustomDomainAdminMutation(\n  $slug: String!\n  $hostname: String!\n) {\n  bindGuildCustomDomain(slug: $slug, hostname: $hostname) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a4e641260b5be5808447f205981f550c";

export default node;
