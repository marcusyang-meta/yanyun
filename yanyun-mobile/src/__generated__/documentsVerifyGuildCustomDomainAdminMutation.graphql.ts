/**
 * @generated SignedSource<<fcd06c300c0ca0475842d3f98fe82cc7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsVerifyGuildCustomDomainAdminMutation$variables = {
  slug: string;
};
export type documentsVerifyGuildCustomDomainAdminMutation$data = {
  readonly verifyGuildCustomDomain: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsVerifyGuildCustomDomainAdminMutation = {
  response: documentsVerifyGuildCustomDomainAdminMutation$data;
  variables: documentsVerifyGuildCustomDomainAdminMutation$variables;
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
    "name": "documentsVerifyGuildCustomDomainAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "verifyGuildCustomDomain",
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
    "name": "documentsVerifyGuildCustomDomainAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "verifyGuildCustomDomain",
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
    "cacheID": "b802ca50dd5bb98cef1abfccb955824a",
    "id": null,
    "metadata": {},
    "name": "documentsVerifyGuildCustomDomainAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsVerifyGuildCustomDomainAdminMutation(\n  $slug: String!\n) {\n  verifyGuildCustomDomain(slug: $slug) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c286fdbdd73e30c0ae10cce279c8e613";

export default node;
