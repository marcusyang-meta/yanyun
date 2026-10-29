/**
 * @generated SignedSource<<fa5cb81bbf37264601d0b02f809b3dda>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOpsPreviewQuery$variables = {
  eventId: number;
  segmentKind: string;
  segmentValue?: string | null | undefined;
  slug: string;
};
export type GuildAdminOpsPreviewQuery$data = {
  readonly targetedNudgePreview: {
    readonly __typename: "TargetedNudgePreview";
    readonly candidateCount: number;
    readonly candidates: ReadonlyArray<{
      readonly discordId: string;
      readonly displayName: string;
      readonly knownRole: string;
      readonly knownWeapon: string;
      readonly lastText: string;
    }>;
    readonly countText: string;
    readonly dailyRemaining: number;
    readonly emptyText: string | null | undefined;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
};
export type GuildAdminOpsPreviewQuery = {
  response: GuildAdminOpsPreviewQuery$data;
  variables: GuildAdminOpsPreviewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "eventId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "segmentKind"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "segmentValue"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "eventId",
        "variableName": "eventId"
      },
      {
        "kind": "Variable",
        "name": "segmentKind",
        "variableName": "segmentKind"
      },
      {
        "kind": "Variable",
        "name": "segmentValue",
        "variableName": "segmentValue"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "targetedNudgePreview",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "candidateCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "countText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "emptyText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dailyRemaining",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "OpsNudgeCandidate",
            "kind": "LinkedField",
            "name": "candidates",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "discordId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "displayName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "knownWeapon",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "knownRole",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lastText",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "type": "TargetedNudgePreview",
        "abstractKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminOpsPreviewQuery",
    "selections": (v4/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminOpsPreviewQuery",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "8f19723a63aeb75c86efef88e3bd0018",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOpsPreviewQuery",
    "operationKind": "query",
    "text": "query GuildAdminOpsPreviewQuery(\n  $slug: String!\n  $eventId: Int!\n  $segmentKind: String!\n  $segmentValue: String\n) {\n  targetedNudgePreview(slug: $slug, eventId: $eventId, segmentKind: $segmentKind, segmentValue: $segmentValue) {\n    __typename\n    ... on TargetedNudgePreview {\n      candidateCount\n      countText\n      emptyText\n      dailyRemaining\n      candidates {\n        discordId\n        displayName\n        knownWeapon\n        knownRole\n        lastText\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b243a63bc0ccd0366e5fff991f3ad0c";

export default node;
