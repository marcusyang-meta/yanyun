/**
 * @generated SignedSource<<83d931c411311a32cedd01eea2925b6f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminPremiumCheckoutMutation$variables = {
  slug: string;
};
export type GuildAdminPremiumCheckoutMutation$data = {
  readonly startPremiumCheckout: {
    readonly checkoutUrl: string | null | undefined;
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPremiumCheckoutMutation = {
  response: GuildAdminPremiumCheckoutMutation$data;
  variables: GuildAdminPremiumCheckoutMutation$variables;
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
    "name": "GuildAdminPremiumCheckoutMutation",
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
    "name": "GuildAdminPremiumCheckoutMutation",
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
    "cacheID": "e64d55bf5a8b79ec4720fce032664aba",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPremiumCheckoutMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPremiumCheckoutMutation(\n  $slug: String!\n) {\n  startPremiumCheckout(slug: $slug) {\n    ok\n    error\n    checkoutUrl\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "4dacc2b222c027fa2d081309d577d247";

export default node;
