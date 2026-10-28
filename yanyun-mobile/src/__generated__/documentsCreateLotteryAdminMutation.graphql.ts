/**
 * @generated SignedSource<<ad998b4209041f992bc3da5816391c06>>
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
export type documentsCreateLotteryAdminMutation$variables = {
  input: CreateLotteryInput;
  slug: string;
};
export type documentsCreateLotteryAdminMutation$data = {
  readonly createLottery: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsCreateLotteryAdminMutation = {
  response: documentsCreateLotteryAdminMutation$data;
  variables: documentsCreateLotteryAdminMutation$variables;
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
    "alias": null,
    "args": [
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
    "concreteType": "GuildAdminPayload",
    "kind": "LinkedField",
    "name": "createLottery",
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
      },
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsCreateLotteryAdminMutation",
    "selections": (v2/*:: as any*/),
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
    "name": "documentsCreateLotteryAdminMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "4c8d1e64b8140a67c9520d89ad9a0e96",
    "id": null,
    "metadata": {},
    "name": "documentsCreateLotteryAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCreateLotteryAdminMutation(\n  $slug: String!\n  $input: CreateLotteryInput!\n) {\n  createLottery(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "05f274df30fc01143110ba6ae47e381f";

export default node;
