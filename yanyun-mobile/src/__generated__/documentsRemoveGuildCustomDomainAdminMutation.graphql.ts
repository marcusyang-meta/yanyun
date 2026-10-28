/**
 * @generated SignedSource<<bb9403a0dde82817627fa4000d3f6c46>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsRemoveGuildCustomDomainAdminMutation$variables = {
  slug: string;
};
export type documentsRemoveGuildCustomDomainAdminMutation$data = {
  readonly removeGuildCustomDomain: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsRemoveGuildCustomDomainAdminMutation = {
  response: documentsRemoveGuildCustomDomainAdminMutation$data;
  variables: documentsRemoveGuildCustomDomainAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsRemoveGuildCustomDomainAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "removeGuildCustomDomain",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsRemoveGuildCustomDomainAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "removeGuildCustomDomain",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
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
    "cacheID": "39b4cd3ca4b31cb4220229d6f96b7fd0",
    "id": null,
    "metadata": {},
    "name": "documentsRemoveGuildCustomDomainAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsRemoveGuildCustomDomainAdminMutation(\n  $slug: String!\n) {\n  removeGuildCustomDomain(slug: $slug) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6100b389db40be6c47f46e64d1d31bfd";

export default node;
