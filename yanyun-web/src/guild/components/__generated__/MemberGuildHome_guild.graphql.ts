/**
 * @generated SignedSource<<f2ea35c774645186c2c536660360d8a2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MemberGuildHome_guild$data = {
  readonly avatarUrl: string | null | undefined;
  readonly detailBackToListLabel: string;
  readonly detailNotFoundText: string;
  readonly gameVersion: string;
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
    readonly __typename: "GuildInsightsLocked";
    readonly premiumTitle: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly homeAdminLabel: string | null | undefined;
  readonly homeInsightsGearMinScoreLabel: string;
  readonly homeInsightsGearScoreLabel: string;
  readonly homeInsightsRaceBestLabel: string;
  readonly homeInsightsRaceEmptyText: string;
  readonly homeInsightsRaceRunsLabel: string;
  readonly homeInsightsRaceTeamLabel: string;
  readonly homeInsightsRaceTitle: string;
  readonly homeInsightsRaceWinsLabel: string;
  readonly homeInsightsSelfGearTitle: string;
  readonly homeTabAlliesLabel: string | null | undefined;
  readonly homeTabAnnouncementsLabel: string;
  readonly homeTabDexLabel: string;
  readonly homeTabMarketLabel: string;
  readonly homeTabScheduleLabel: string;
  readonly homeTabSectLabel: string;
  readonly homeTabTeamLabel: string;
  readonly name: string | null | undefined;
  readonly pageBackLabel: string;
  readonly pageFooterDisclaimerText: string | null | undefined;
  readonly raceSeasonBoard: {
    readonly __typename: "GuildInsightsLocked";
    readonly premiumTitle: string;
  } | {
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
  } | null | undefined;
  readonly slogan: string | null | undefined;
  readonly slug: string;
  readonly viewerNick: string | null | undefined;
  readonly " $fragmentType": "MemberGuildHome_guild";
};
export type MemberGuildHome_guild$key = {
  readonly " $data"?: MemberGuildHome_guild$data;
  readonly " $fragmentSpreads": FragmentRefs<"MemberGuildHome_guild">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "premiumTitle",
      "storageKey": null
    }
  ],
  "type": "GuildInsightsLocked",
  "abstractKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MemberGuildHome_guild",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "slogan",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "gameVersion",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerNick",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pageBackLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pageFooterDisclaimerText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabTeamLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabDexLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabSectLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabAnnouncementsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabScheduleLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabMarketLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabAlliesLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeAdminLabel",
      "storageKey": null
    },
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
        (v0/*:: as any*/),
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
        },
        (v1/*:: as any*/)
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
        (v0/*:: as any*/),
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
        },
        (v1/*:: as any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "detailNotFoundText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "detailBackToListLabel",
      "storageKey": null
    }
  ],
  "type": "Guild",
  "abstractKey": null
};
})();

(node as any).hash = "d0890b4303b71ec3756be46c59050ca4";

export default node;
