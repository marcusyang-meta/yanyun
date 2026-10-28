/**
 * @generated SignedSource<<9cb4a6dda9341a58be80900bb0006157>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGuildInsightsBoardQuery$variables = {
  slug: string;
};
export type documentsGuildInsightsBoardQuery$data = {
  readonly viewer: {
    readonly guild: {
      readonly __typename: "Guild";
      readonly gearSelfStatus: {
        readonly __typename: "GuildGearSelfStatus";
        readonly entries: ReadonlyArray<{
          readonly label: string;
          readonly met: boolean;
          readonly minScore: number;
          readonly myScore: number | null | undefined;
          readonly standardId: string;
          readonly statusText: string;
        }>;
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      };
      readonly homeInsightsGearMinScoreLabel: string;
      readonly homeInsightsGearScoreLabel: string;
      readonly homeInsightsRaceBestLabel: string;
      readonly homeInsightsRaceEmptyText: string;
      readonly homeInsightsRaceRunsLabel: string;
      readonly homeInsightsRaceTeamLabel: string;
      readonly homeInsightsRaceTitle: string;
      readonly homeInsightsRaceWinsLabel: string;
      readonly homeInsightsSelfGearTitle: string;
      readonly raceSeasonBoard: {
        readonly __typename: "RaceSeasonBoard";
        readonly seasons: ReadonlyArray<{
          readonly entries: ReadonlyArray<{
            readonly bestTimeMs: number;
            readonly bestTimeText: string;
            readonly members: string;
            readonly runCount: number;
            readonly teamName: string;
            readonly winCount: number;
          }>;
          readonly season: string;
          readonly seasonLabel: string;
        }>;
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      };
    } | null | undefined;
  };
};
export type documentsGuildInsightsBoardQuery = {
  response: documentsGuildInsightsBoardQuery$data;
  variables: documentsGuildInsightsBoardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "slug",
            "variableName": "slug"
          }
        ],
        "concreteType": "Guild",
        "kind": "LinkedField",
        "name": "guild",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsRaceTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsRaceEmptyText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsRaceTeamLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsRaceRunsLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsRaceWinsLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsRaceBestLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsSelfGearTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsGearScoreLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeInsightsGearMinScoreLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "raceSeasonBoard",
            "plural": false,
            "selections": [
              (v1/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RaceSeason",
                    "kind": "LinkedField",
                    "name": "seasons",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "season",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "seasonLabel",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "RaceSeasonEntry",
                        "kind": "LinkedField",
                        "name": "entries",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "teamName",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "members",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "runCount",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "winCount",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "bestTimeMs",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "bestTimeText",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "type": "RaceSeasonBoard",
                "abstractKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "gearSelfStatus",
            "plural": false,
            "selections": [
              (v1/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GearSelfEntry",
                    "kind": "LinkedField",
                    "name": "entries",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "standardId",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "label",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "minScore",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "myScore",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "met",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "statusText",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "type": "GuildGearSelfStatus",
                "abstractKey": null
              }
            ],
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
    "name": "documentsGuildInsightsBoardQuery",
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGuildInsightsBoardQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "9a86d70fe3fa88ffb1bf9bdbd76fbc36",
    "id": null,
    "metadata": {},
    "name": "documentsGuildInsightsBoardQuery",
    "operationKind": "query",
    "text": "query documentsGuildInsightsBoardQuery(\n  $slug: String!\n) {\n  viewer {\n    guild(slug: $slug) {\n      __typename\n      homeInsightsRaceTitle\n      homeInsightsRaceEmptyText\n      homeInsightsRaceTeamLabel\n      homeInsightsRaceRunsLabel\n      homeInsightsRaceWinsLabel\n      homeInsightsRaceBestLabel\n      homeInsightsSelfGearTitle\n      homeInsightsGearScoreLabel\n      homeInsightsGearMinScoreLabel\n      raceSeasonBoard {\n        __typename\n        ... on RaceSeasonBoard {\n          seasons {\n            season\n            seasonLabel\n            entries {\n              teamName\n              members\n              runCount\n              winCount\n              bestTimeMs\n              bestTimeText\n            }\n          }\n        }\n      }\n      gearSelfStatus {\n        __typename\n        ... on GuildGearSelfStatus {\n          entries {\n            standardId\n            label\n            minScore\n            myScore\n            met\n            statusText\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1733f64ba9d37b0b8c05e3c85654c17d";

export default node;
