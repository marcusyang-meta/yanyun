/**
 * @generated SignedSource<<f2d062bcafbe93b3cdd1769b6a29caea>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildMarketWithdrawOfferMutation$variables = Record<PropertyKey, never>;
export type GuildMarketWithdrawOfferMutation$data = {
  readonly withdrawFillOffer: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildMarketWithdrawOfferMutation = {
  response: GuildMarketWithdrawOfferMutation$data;
  variables: GuildMarketWithdrawOfferMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "NetworkOkPayload",
    "kind": "LinkedField",
    "name": "withdrawFillOffer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildMarketWithdrawOfferMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GuildMarketWithdrawOfferMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "77d3e362b765c49cacb597a2768171d3",
    "id": null,
    "metadata": {},
    "name": "GuildMarketWithdrawOfferMutation",
    "operationKind": "mutation",
    "text": "mutation GuildMarketWithdrawOfferMutation {\n  withdrawFillOffer {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "6973d85af6a8b6cff23ab112a68411d6";

export default node;
