/**
 * @generated SignedSource<<8a179cfaca7e83025f0eeb0ff2708129>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @indirectDataDrivenDependency GuildRouteRoot_viewer.guild {"branches":{"Guild":{"component":"MemberGuildHome.react","fragment":"MemberGuildHome_guild$normalization.graphql"}},"plural":false}

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildRouteQuery$variables = {
  slug: string;
};
export type GuildRouteQuery$data = {
  readonly viewer: {
    readonly commonLoadingGuildText: string;
    readonly user: {
      readonly avatar: string | null | undefined;
      readonly discordId: string;
      readonly name: string;
    } | null | undefined;
    readonly userBarLoggingOutLabel: string;
    readonly userBarLogoutLabel: string;
    readonly userBarSettingsLabel: string;
    readonly " $fragmentSpreads": FragmentRefs<"GuildRouteRoot_viewer">;
  };
};
export type GuildRouteQuery = {
  response: GuildRouteQuery$data;
  variables: GuildRouteQuery$variables;
};

import JSResource from 'JSResource';

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
  "concreteType": "DiscordUser",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatar",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userBarLogoutLabel",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userBarLoggingOutLabel",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userBarSettingsLabel",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonLoadingGuildText",
  "storageKey": null
},
v6 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildRouteQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          {
            "args": (v6/*:: as any*/),
            "kind": "FragmentSpread",
            "name": "GuildRouteRoot_viewer"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildRouteQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": (v6/*:: as any*/),
            "concreteType": "Guild",
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              {
                "args": null,
                "documentName": "GuildRouteRoot_viewer",
                "fragmentName": "MemberGuildHome_guild",
                "fragmentPropName": "guild",
                "kind": "ModuleImport",
                "componentModuleProvider": () => JSResource('m#MemberGuildHome.react'),
                "operationModuleProvider": () => JSResource('m#MemberGuildHome_guild$normalization.graphql')
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "53ff0a428a028055311421b930a0a2ff",
    "id": null,
    "metadata": {},
    "name": "GuildRouteQuery",
    "operationKind": "query",
    "text": "query GuildRouteQuery(\n  $slug: String!\n) {\n  viewer {\n    user {\n      discordId\n      name\n      avatar\n    }\n    userBarLogoutLabel\n    userBarLoggingOutLabel\n    userBarSettingsLabel\n    commonLoadingGuildText\n    ...GuildRouteRoot_viewer_20J5Pl\n  }\n}\n\nfragment GuildRouteRoot_viewer_20J5Pl on Viewer {\n  guild(slug: $slug) {\n    ...MemberGuildHome_guild\n  }\n}\n\nfragment MemberGuildHome_guild on Guild {\n  slug\n  name\n  slogan\n  gameVersion\n  avatarUrl\n  viewerNick\n  pageBackLabel\n  pageFooterDisclaimerText\n  homeTabTeamLabel\n  homeTabDexLabel\n  homeTabSectLabel\n  homeTabAnnouncementsLabel\n  homeTabScheduleLabel\n  homeTabMarketLabel\n  homeTabAlliesLabel\n  homeAdminLabel\n  homeRailProfileLabel\n  homeRailMoreLabel\n  homeRailAppearanceLabel\n  homeRailThemeClassicLabel\n  homeRailThemeGlassLabel\n  homeInsightsRaceTitle\n  homeInsightsRaceEmptyText\n  homeInsightsRaceTeamLabel\n  homeInsightsRaceRunsLabel\n  homeInsightsRaceWinsLabel\n  homeInsightsRaceBestLabel\n  homeInsightsSelfGearTitle\n  homeInsightsGearScoreLabel\n  homeInsightsGearMinScoreLabel\n  raceSeasonBoard {\n    __typename\n    ... on RaceSeasonBoard {\n      seasons {\n        season\n        seasonLabel\n        entries {\n          teamName\n          members\n          runCount\n          winCount\n          bestTimeMs\n          bestTimeText\n        }\n      }\n    }\n    ... on GuildInsightsLocked {\n      premiumTitle\n    }\n  }\n  gearSelfStatus {\n    __typename\n    ... on GuildGearSelfStatus {\n      entries {\n        standardId\n        label\n        minScore\n        myScore\n        met\n        statusText\n      }\n    }\n    ... on GuildInsightsLocked {\n      premiumTitle\n    }\n  }\n  detailNotFoundText\n  detailBackToListLabel\n}\n"
  }
};
})();

(node as any).hash = "8c10d3e9a2cef0a8ce3fb87462b43f65";

export default node;
