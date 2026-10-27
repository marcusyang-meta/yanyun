/**
 * @generated SignedSource<<67424c1e9f909de2245f5c2715fb9215>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsStartPremiumCheckoutAdminMutation$variables = {
  slug: string;
};
export type documentsStartPremiumCheckoutAdminMutation$data = {
  readonly startPremiumCheckout: {
    readonly checkoutUrl: string | null | undefined;
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsStartPremiumCheckoutAdminMutation = {
  response: documentsStartPremiumCheckoutAdminMutation$data;
  variables: documentsStartPremiumCheckoutAdminMutation$variables;
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
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "checkoutUrl",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsStartPremiumCheckoutAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "startPremiumCheckout",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsStartPremiumCheckoutAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "startPremiumCheckout",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
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
    "cacheID": "507a65ee2ad1a681adbc7c4409419cb6",
    "id": null,
    "metadata": {},
    "name": "documentsStartPremiumCheckoutAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsStartPremiumCheckoutAdminMutation(\n  $slug: String!\n) {\n  startPremiumCheckout(slug: $slug) {\n    ok\n    error\n    checkoutUrl\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "aec39c0712f981a98513b606cf153cd2";

export default node;
