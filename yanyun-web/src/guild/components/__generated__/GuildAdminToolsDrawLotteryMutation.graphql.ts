/**
 * @generated SignedSource<<d1da98bc0f71d95a9af5e640385b6876>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminToolsDrawLotteryMutation$variables = {
  id: string;
  slug: string;
};
export type GuildAdminToolsDrawLotteryMutation$data = {
  readonly drawLottery: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminToolsDrawLotteryMutation = {
  response: GuildAdminToolsDrawLotteryMutation$data;
  variables: GuildAdminToolsDrawLotteryMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
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
    "variableName": "id"
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
    "name": "GuildAdminToolsDrawLotteryMutation",
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
    "name": "GuildAdminToolsDrawLotteryMutation",
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
    "cacheID": "38bdec223c1be3a1484dc8afba87837f",
    "id": null,
    "metadata": {},
    "name": "GuildAdminToolsDrawLotteryMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminToolsDrawLotteryMutation(\n  $slug: String!\n  $id: ID!\n) {\n  drawLottery(slug: $slug, lotteryId: $id) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "f62e11e2f9f893f6c8a7bb4bc38e581f";

export default node;
