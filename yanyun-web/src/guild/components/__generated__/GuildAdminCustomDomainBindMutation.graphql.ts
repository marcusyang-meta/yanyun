/**
 * @generated SignedSource<<af0b2d2e1c36b3c7ef8b5ba211a43930>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminCustomDomainBindMutation$variables = {
  hostname: string;
  slug: string;
};
export type GuildAdminCustomDomainBindMutation$data = {
  readonly bindGuildCustomDomain: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminCustomDomainBindMutation = {
  response: GuildAdminCustomDomainBindMutation$data;
  variables: GuildAdminCustomDomainBindMutation$variables;
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
    "name": "GuildAdminCustomDomainBindMutation",
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
    "name": "GuildAdminCustomDomainBindMutation",
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
    "cacheID": "c5a0ec6a34e93db3bd8863faf5bb9ce8",
    "id": null,
    "metadata": {},
    "name": "GuildAdminCustomDomainBindMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminCustomDomainBindMutation(\n  $slug: String!\n  $hostname: String!\n) {\n  bindGuildCustomDomain(slug: $slug, hostname: $hostname) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1ff72f0a799b6b1a694f7de9a42e43df";

export default node;
