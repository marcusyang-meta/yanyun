/**
 * @generated SignedSource<<b4dae8c596b7dfea522d50f03bdbc4bb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDrawLotteryAdminMutation$variables = {
  lotteryId: string;
  slug: string;
};
export type documentsDrawLotteryAdminMutation$data = {
  readonly drawLottery: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDrawLotteryAdminMutation = {
  response: documentsDrawLotteryAdminMutation$data;
  variables: documentsDrawLotteryAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "lotteryId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "lotteryId",
    "variableName": "lotteryId"
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
    "name": "documentsDrawLotteryAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "drawLottery",
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
    "name": "documentsDrawLotteryAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "drawLottery",
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
    "cacheID": "25e9b04f9ee0b90fb2c38c58f3a655e0",
    "id": null,
    "metadata": {},
    "name": "documentsDrawLotteryAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDrawLotteryAdminMutation(\n  $slug: String!\n  $lotteryId: ID!\n) {\n  drawLottery(slug: $slug, lotteryId: $lotteryId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "86abed018a6f98cd58729573e9aa4559";

export default node;
