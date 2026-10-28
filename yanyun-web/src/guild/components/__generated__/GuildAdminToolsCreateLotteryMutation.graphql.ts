/**
 * @generated SignedSource<<84c77ad59d84ffc065e14bb6fd0f2a87>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type LotterySource = "GROUPING" | "MEMBERS" | "%future added value";
export type CreateLotteryInput = {
  entries?: ReadonlyArray<LotteryEntryInput> | null | undefined;
  prize?: string | null | undefined;
  source: LotterySource;
  sourceEventId?: string | null | undefined;
  title: string;
  uniformWeight?: number | null | undefined;
  winnerCount: number;
};
export type LotteryEntryInput = {
  discordId: string;
  weight: number;
};
export type GuildAdminToolsCreateLotteryMutation$variables = {
  input: CreateLotteryInput;
  slug: string;
};
export type GuildAdminToolsCreateLotteryMutation$data = {
  readonly createLottery: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminToolsCreateLotteryMutation = {
  response: GuildAdminToolsCreateLotteryMutation$data;
  variables: GuildAdminToolsCreateLotteryMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
    "name": "GuildAdminToolsCreateLotteryMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "createLottery",
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
    "name": "GuildAdminToolsCreateLotteryMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "createLottery",
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
    "cacheID": "712452499eb06b40d4d2008fc3076336",
    "id": null,
    "metadata": {},
    "name": "GuildAdminToolsCreateLotteryMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminToolsCreateLotteryMutation(\n  $slug: String!\n  $input: CreateLotteryInput!\n) {\n  createLottery(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ee9406dd605dec10a57c99e7e30fc867";

export default node;
