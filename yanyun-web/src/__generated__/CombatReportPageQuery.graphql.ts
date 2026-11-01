/**
 * @generated SignedSource<<0c41eaaeb20acba94e71905bf6d7f222>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CombatEncounterResult = "KILL" | "UNKNOWN" | "WIPE" | "%future added value";
export type CombatReportPageQuery$variables = {
  encounterId?: string | null | undefined;
  groupingId: string;
  slug?: string | null | undefined;
};
export type CombatReportPageQuery$data = {
  readonly combatReportPage: {
    readonly __typename: "GroupingCombatReportEmpty";
    readonly body: string;
    readonly title: string;
  } | {
    readonly __typename: "GroupingCombatReportLocked";
    readonly body: string;
    readonly title: string;
  } | {
    readonly __typename: "GroupingCombatReportReady";
    readonly backLabel: string;
    readonly detail: {
      readonly activityNote: string;
      readonly bossName: string;
      readonly buffRows: ReadonlyArray<{
        readonly applierName: string;
        readonly buffName: string;
        readonly intervals: ReadonlyArray<{
          readonly endMs: number;
          readonly startMs: number;
        }>;
        readonly multiplierText: string;
        readonly targetName: string;
        readonly uptimePctText: string;
      }>;
      readonly castRows: ReadonlyArray<{
        readonly playerName: string;
        readonly skillName: string;
        readonly timeText: string;
      }>;
      readonly castsLocalTitle: string | null | undefined;
      readonly colActivity: string;
      readonly colApplier: string;
      readonly colAvg: string;
      readonly colBuff: string;
      readonly colCasts: string;
      readonly colCrit: string;
      readonly colDps: string;
      readonly colHits: string;
      readonly colMax: string;
      readonly colPlayer: string;
      readonly colRShare: string;
      readonly colRdps: string;
      readonly colShare: string;
      readonly colSkill: string;
      readonly colSpec: string;
      readonly colTarget: string;
      readonly colTime: string;
      readonly colTotal: string;
      readonly colUptime: string;
      readonly dpsSeries: ReadonlyArray<{
        readonly damage: number;
        readonly second: number;
      }>;
      readonly durationMs: number;
      readonly durationText: string;
      readonly modelVersionText: string;
      readonly overviewLines: ReadonlyArray<string>;
      readonly partyRows: ReadonlyArray<{
        readonly activityPctText: string;
        readonly dpsText: string;
        readonly guestTag: string | null | undefined;
        readonly memberName: string | null | undefined;
        readonly playerName: string;
        readonly rSharePctText: string;
        readonly rdpsText: string;
        readonly total: number;
      }>;
      readonly rdpsNote: string;
      readonly resultText: string;
      readonly skillTables: ReadonlyArray<{
        readonly playerName: string;
        readonly rows: ReadonlyArray<{
          readonly avgText: string;
          readonly casts: number;
          readonly critPctText: string;
          readonly dpsText: string;
          readonly hits: number;
          readonly maxHit: number;
          readonly sharePctText: string;
          readonly skillName: string;
          readonly specPctText: string;
          readonly total: number;
        }>;
      }>;
      readonly startedAtText: string;
      readonly timelineTitle: string;
    } | null | undefined;
    readonly encounters: ReadonlyArray<{
      readonly bossName: string;
      readonly durationText: string;
      readonly id: string;
      readonly result: CombatEncounterResult;
      readonly resultText: string;
      readonly sourceText: string;
      readonly startedAtText: string;
      readonly teamDpsText: string;
      readonly uploaderText: string;
    }>;
    readonly encountersTitle: string;
    readonly tabBuffsLabel: string;
    readonly tabCastsLabel: string;
    readonly tabDamageLabel: string;
    readonly tabOverviewLabel: string;
    readonly tabTimelineLabel: string;
    readonly title: string;
    readonly viewReportLabel: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
};
export type CombatReportPageQuery = {
  response: CombatReportPageQuery$data;
  variables: CombatReportPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "encounterId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "groupingId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v4 = [
  (v3/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "body",
    "storageKey": null
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossName",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startedAtText",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "durationText",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resultText",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "playerName",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dpsText",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "skillName",
  "storageKey": null
},
v13 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "encounterId",
        "variableName": "encounterId"
      },
      {
        "kind": "Variable",
        "name": "groupingId",
        "variableName": "groupingId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "combatReportPage",
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
        "selections": (v4/*:: as any*/),
        "type": "GroupingCombatReportLocked",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": (v4/*:: as any*/),
        "type": "GroupingCombatReportEmpty",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": [
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "encountersTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewReportLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "backLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "tabOverviewLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "tabDamageLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "tabBuffsLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "tabCastsLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "tabTimelineLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "CombatEncounterSummary",
            "kind": "LinkedField",
            "name": "encounters",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              (v5/*:: as any*/),
              (v6/*:: as any*/),
              (v7/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "result",
                "storageKey": null
              },
              (v8/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "teamDpsText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "uploaderText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "sourceText",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "CombatEncounterDetail",
            "kind": "LinkedField",
            "name": "detail",
            "plural": false,
            "selections": [
              (v5/*:: as any*/),
              (v8/*:: as any*/),
              (v7/*:: as any*/),
              (v6/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "overviewLines",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "modelVersionText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "activityNote",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rdpsNote",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "castsLocalTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "timelineTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "durationMs",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colPlayer",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colTotal",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colActivity",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colDps",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colRdps",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colRShare",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colSkill",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colCasts",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colHits",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colAvg",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colCrit",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colSpec",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colMax",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colShare",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colBuff",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colApplier",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colTarget",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colUptime",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "colTime",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CombatPartyRow",
                "kind": "LinkedField",
                "name": "partyRows",
                "plural": true,
                "selections": [
                  (v9/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "memberName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "guestTag",
                    "storageKey": null
                  },
                  (v10/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "activityPctText",
                    "storageKey": null
                  },
                  (v11/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rdpsText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rSharePctText",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CombatSkillTable",
                "kind": "LinkedField",
                "name": "skillTables",
                "plural": true,
                "selections": [
                  (v9/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "CombatSkillRow",
                    "kind": "LinkedField",
                    "name": "rows",
                    "plural": true,
                    "selections": [
                      (v12/*:: as any*/),
                      (v10/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "casts",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hits",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "avgText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "critPctText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "specPctText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "maxHit",
                        "storageKey": null
                      },
                      (v11/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "sharePctText",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CombatBuffRow",
                "kind": "LinkedField",
                "name": "buffRows",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "buffName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "applierName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "targetName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "multiplierText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "uptimePctText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "CombatInterval",
                    "kind": "LinkedField",
                    "name": "intervals",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "startMs",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "endMs",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CombatCastRow",
                "kind": "LinkedField",
                "name": "castRows",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "timeText",
                    "storageKey": null
                  },
                  (v9/*:: as any*/),
                  (v12/*:: as any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "CombatDpsPoint",
                "kind": "LinkedField",
                "name": "dpsSeries",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "second",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "damage",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "type": "GroupingCombatReportReady",
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
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "CombatReportPageQuery",
    "selections": (v13/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "CombatReportPageQuery",
    "selections": (v13/*:: as any*/)
  },
  "params": {
    "cacheID": "d34ea59ecd50ceb490149a95b3472af2",
    "id": null,
    "metadata": {},
    "name": "CombatReportPageQuery",
    "operationKind": "query",
    "text": "query CombatReportPageQuery(\n  $slug: String\n  $groupingId: ID!\n  $encounterId: ID\n) {\n  combatReportPage(slug: $slug, groupingId: $groupingId, encounterId: $encounterId) {\n    __typename\n    ... on GroupingCombatReportLocked {\n      title\n      body\n    }\n    ... on GroupingCombatReportEmpty {\n      title\n      body\n    }\n    ... on GroupingCombatReportReady {\n      title\n      encountersTitle\n      viewReportLabel\n      backLabel\n      tabOverviewLabel\n      tabDamageLabel\n      tabBuffsLabel\n      tabCastsLabel\n      tabTimelineLabel\n      encounters {\n        id\n        bossName\n        startedAtText\n        durationText\n        result\n        resultText\n        teamDpsText\n        uploaderText\n        sourceText\n      }\n      detail {\n        bossName\n        resultText\n        durationText\n        startedAtText\n        overviewLines\n        modelVersionText\n        activityNote\n        rdpsNote\n        castsLocalTitle\n        timelineTitle\n        durationMs\n        colPlayer\n        colTotal\n        colActivity\n        colDps\n        colRdps\n        colRShare\n        colSkill\n        colCasts\n        colHits\n        colAvg\n        colCrit\n        colSpec\n        colMax\n        colShare\n        colBuff\n        colApplier\n        colTarget\n        colUptime\n        colTime\n        partyRows {\n          playerName\n          memberName\n          guestTag\n          total\n          activityPctText\n          dpsText\n          rdpsText\n          rSharePctText\n        }\n        skillTables {\n          playerName\n          rows {\n            skillName\n            total\n            casts\n            hits\n            avgText\n            critPctText\n            specPctText\n            maxHit\n            dpsText\n            sharePctText\n          }\n        }\n        buffRows {\n          buffName\n          applierName\n          targetName\n          multiplierText\n          uptimePctText\n          intervals {\n            startMs\n            endMs\n          }\n        }\n        castRows {\n          timeText\n          playerName\n          skillName\n        }\n        dpsSeries {\n          second\n          damage\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "86c2adb6ce28611018e8ae7e36e156e2";

export default node;
