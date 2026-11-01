/**
 * @generated SignedSource<<05c586d0a6c522fbe75c134abab809dd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageBackfillKunpengDexMutation$variables = {
  dryRun: boolean;
};
export type PlatformAdminPageBackfillKunpengDexMutation$data = {
  readonly platformAdminBackfillKunpengDex: {
    readonly bosses: ReadonlyArray<{
      readonly created: boolean;
      readonly guideWritten: boolean;
      readonly id: number | null | undefined;
      readonly mechanics: number;
      readonly name: string;
      readonly shouts: number;
      readonly talents: number;
    }>;
    readonly bossesCreated: number;
    readonly dryRun: boolean;
    readonly dungeonCreated: boolean;
    readonly dungeonName: string;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly previousCurrentCleared: boolean;
  };
};
export type PlatformAdminPageBackfillKunpengDexMutation = {
  response: PlatformAdminPageBackfillKunpengDexMutation$data;
  variables: PlatformAdminPageBackfillKunpengDexMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "dryRun"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "dryRun",
        "variableName": "dryRun"
      }
    ],
    "concreteType": "PlatformKunpengDexBackfillPayload",
    "kind": "LinkedField",
    "name": "platformAdminBackfillKunpengDex",
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
        "name": "errorCode",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dryRun",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dungeonCreated",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dungeonName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "bossesCreated",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "previousCurrentCleared",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PlatformKunpengDexBossEntry",
        "kind": "LinkedField",
        "name": "bosses",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "created",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "guideWritten",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "mechanics",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "talents",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "shouts",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageBackfillKunpengDexMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageBackfillKunpengDexMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "686c7154cbcfeed4f3dc564d26511a70",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageBackfillKunpengDexMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageBackfillKunpengDexMutation(\n  $dryRun: Boolean!\n) {\n  platformAdminBackfillKunpengDex(dryRun: $dryRun) {\n    ok\n    error\n    errorCode\n    dryRun\n    dungeonCreated\n    dungeonName\n    bossesCreated\n    previousCurrentCleared\n    bosses {\n      id\n      name\n      created\n      guideWritten\n      mechanics\n      talents\n      shouts\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "549a2332eaddfffc5e4e5a9a93aa3f0e";

export default node;
