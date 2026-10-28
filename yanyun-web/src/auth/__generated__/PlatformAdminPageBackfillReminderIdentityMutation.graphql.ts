/**
 * @generated SignedSource<<d3af4120ac5d3d9d58e543b3afeb5876>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageBackfillReminderIdentityMutation$variables = {
  dryRun: boolean;
};
export type PlatformAdminPageBackfillReminderIdentityMutation$data = {
  readonly platformAdminBackfillReminderIdentity: {
    readonly ambiguous: number;
    readonly dryRun: boolean;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly guilds: ReadonlyArray<{
      readonly ambiguous: number;
      readonly discordGuildId: string;
      readonly rosterSeeded: number;
      readonly seatsTotal: number;
      readonly slug: string;
      readonly stamped: number;
      readonly unmatched: number;
    }>;
    readonly ok: boolean;
    readonly rosterSeeded: number;
    readonly seatsTotal: number;
    readonly stamped: number;
    readonly unmatched: number;
  };
};
export type PlatformAdminPageBackfillReminderIdentityMutation = {
  response: PlatformAdminPageBackfillReminderIdentityMutation$data;
  variables: PlatformAdminPageBackfillReminderIdentityMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "dryRun"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "rosterSeeded",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatsTotal",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stamped",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ambiguous",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "unmatched",
  "storageKey": null
},
v6 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "dryRun",
        "variableName": "dryRun"
      }
    ],
    "concreteType": "PlatformReminderIdentityBackfillPayload",
    "kind": "LinkedField",
    "name": "platformAdminBackfillReminderIdentity",
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
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "PlatformReminderIdentityGuild",
        "kind": "LinkedField",
        "name": "guilds",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slug",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "discordGuildId",
            "storageKey": null
          },
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/)
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
    "name": "PlatformAdminPageBackfillReminderIdentityMutation",
    "selections": (v6/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageBackfillReminderIdentityMutation",
    "selections": (v6/*:: as any*/)
  },
  "params": {
    "cacheID": "bf24562ce053c5f19e2fb2836a5cf8a3",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageBackfillReminderIdentityMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageBackfillReminderIdentityMutation(\n  $dryRun: Boolean!\n) {\n  platformAdminBackfillReminderIdentity(dryRun: $dryRun) {\n    ok\n    error\n    errorCode\n    dryRun\n    rosterSeeded\n    seatsTotal\n    stamped\n    ambiguous\n    unmatched\n    guilds {\n      slug\n      discordGuildId\n      rosterSeeded\n      seatsTotal\n      stamped\n      ambiguous\n      unmatched\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2d315f166782676d0efa8a497acc47d9";

export default node;
