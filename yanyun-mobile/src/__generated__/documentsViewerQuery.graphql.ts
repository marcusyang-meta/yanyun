/**
 * @generated SignedSource<<eb9daab91d0a8666ed6a7c2dff85907d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MentorPairingStatus = "ACTIVE" | "ENDED" | "%future added value";
export type RecruitApplicationStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
export type documentsViewerQuery$variables = Record<PropertyKey, never>;
export type documentsViewerQuery$data = {
  readonly viewer: {
    readonly commonRenderErrorHint: string;
    readonly commonRenderErrorTemplate: string;
    readonly commonUnknownErrorText: string;
    readonly footerDisclaimerText: string;
    readonly footerPrivacyLabel: string;
    readonly footerTermsLabel: string;
    readonly guilds: ReadonlyArray<{
      readonly avatarUrl: string | null | undefined;
      readonly gameVersion: string;
      readonly homeInsightsRaceTitle: string;
      readonly homeTabAnnouncementsLabel: string;
      readonly homeTabDexLabel: string;
      readonly homeTabScheduleLabel: string;
      readonly homeTabSectLabel: string;
      readonly homeTabTeamLabel: string;
      readonly memberCount: number;
      readonly name: string | null | undefined;
      readonly pageBackLabel: string;
      readonly raceSeasonBoard: {
        readonly __typename: string;
      };
      readonly slogan: string | null | undefined;
      readonly slug: string;
      readonly viewerNick: string | null | undefined;
    }>;
    readonly homeRecruit: {
      readonly applySectionTitle: string;
      readonly approvedNextStepText: string;
      readonly checklistTitle: string;
      readonly directoryTitle: string;
      readonly guilds: ReadonlyArray<{
        readonly avatarUrl: string | null | undefined;
        readonly myApplicationSection: {
          readonly application: {
            readonly applicantName: string;
            readonly createdAtText: string;
            readonly id: string;
            readonly message: string;
            readonly reviewedAtText: string | null | undefined;
            readonly reviewedByName: string | null | undefined;
            readonly status: RecruitApplicationStatus;
            readonly statusLabel: string;
          } | null | undefined;
        } | null | undefined;
        readonly name: string;
        readonly slogan: string | null | undefined;
        readonly slug: string;
      }>;
      readonly homeBody: string;
      readonly homeLoginHint: string;
      readonly messageLabel: string;
      readonly messagePlaceholder: string;
      readonly myApplicationTitle: string;
      readonly myNewcomer: ReadonlyArray<{
        readonly checklist: {
          readonly items: ReadonlyArray<{
            readonly done: boolean;
            readonly hint: string;
            readonly key: string;
            readonly label: string;
          }>;
          readonly progressText: string;
        } | null | undefined;
        readonly guildName: string;
        readonly myPairings: ReadonlyArray<{
          readonly createdAtText: string;
          readonly endedAtText: string | null | undefined;
          readonly id: string;
          readonly menteeName: string;
          readonly mentorName: string;
          readonly status: MentorPairingStatus;
          readonly statusLabel: string;
        }>;
        readonly slug: string;
      }>;
      readonly myPairingsTitle: string;
      readonly newcomerTitle: string;
      readonly pairingMenteeRoleLabel: string;
      readonly pairingMentorRoleLabel: string;
      readonly pendingHint: string;
      readonly rejectedHint: string;
      readonly submitLabel: string;
      readonly submittingLabel: string;
    };
    readonly loginButtonLabel: string;
    readonly loginCardBody1: string;
    readonly loginCardBody2: string;
    readonly loginCardTitle: string;
    readonly loginPrivacyText: string;
    readonly myLocalePref: string | null | undefined;
    readonly pickerCreateGuildLabel: string;
    readonly pickerCreateGuildMoreLabel: string;
    readonly pickerEmptyBody: string;
    readonly pickerEmptyTitle: string;
    readonly pickerMyGuildsEnLabel: string;
    readonly pickerMyGuildsLabel: string;
    readonly pickerPublicGuildsEnLabel: string;
    readonly pickerPublicGuildsLabel: string;
    readonly pickerReadOnlyBadge: string;
    readonly publicGuilds: ReadonlyArray<{
      readonly avatarUrl: string | null | undefined;
      readonly gameVersion: string;
      readonly homeInsightsRaceTitle: string;
      readonly homeTabAnnouncementsLabel: string;
      readonly homeTabDexLabel: string;
      readonly homeTabScheduleLabel: string;
      readonly homeTabSectLabel: string;
      readonly homeTabTeamLabel: string;
      readonly memberCount: number;
      readonly name: string | null | undefined;
      readonly pageBackLabel: string;
      readonly raceSeasonBoard: {
        readonly __typename: string;
      };
      readonly slogan: string | null | undefined;
      readonly slug: string;
      readonly viewerNick: string | null | undefined;
    }>;
    readonly siteSubtitle: string;
    readonly siteTitle: string;
    readonly user: {
      readonly avatar: string | null | undefined;
      readonly discordId: string;
      readonly name: string;
    } | null | undefined;
    readonly userBarLoggingOutLabel: string;
    readonly userBarLogoutLabel: string;
    readonly userBarSettingsLabel: string;
  };
};
export type documentsViewerQuery = {
  response: documentsViewerQuery$data;
  variables: documentsViewerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slogan",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v4 = [
  (v1/*:: as any*/),
  (v0/*:: as any*/),
  (v2/*:: as any*/),
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
    "name": "memberCount",
    "storageKey": null
  },
  (v3/*:: as any*/),
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
    "name": "homeInsightsRaceTitle",
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
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "pageBackLabel",
    "storageKey": null
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusLabel",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAtText",
  "storageKey": null
},
v9 = [
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
        "args": null,
        "kind": "ScalarField",
        "name": "myLocalePref",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonUnknownErrorText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonRenderErrorTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonRenderErrorHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "siteTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "siteSubtitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "loginCardTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "loginCardBody1",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "loginCardBody2",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "loginButtonLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "loginPrivacyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "footerDisclaimerText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "footerTermsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "footerPrivacyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "userBarSettingsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "userBarLogoutLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "userBarLoggingOutLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerMyGuildsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerMyGuildsEnLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerPublicGuildsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerPublicGuildsEnLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerReadOnlyBadge",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerEmptyTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerEmptyBody",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerCreateGuildLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "pickerCreateGuildMoreLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "DiscordUser",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v0/*:: as any*/),
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
            "name": "avatar",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Guild",
        "kind": "LinkedField",
        "name": "guilds",
        "plural": true,
        "selections": (v4/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GuildReadOnly",
        "kind": "LinkedField",
        "name": "publicGuilds",
        "plural": true,
        "selections": (v4/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "HomeRecruitSection",
        "kind": "LinkedField",
        "name": "homeRecruit",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "directoryTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "newcomerTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeBody",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeLoginHint",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "applySectionTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "messageLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "messagePlaceholder",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "submitLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "submittingLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "myApplicationTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "pendingHint",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "approvedNextStepText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "rejectedHint",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "checklistTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "myPairingsTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "pairingMentorRoleLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "pairingMenteeRoleLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "HomeRecruitGuild",
            "kind": "LinkedField",
            "name": "guilds",
            "plural": true,
            "selections": [
              (v1/*:: as any*/),
              (v0/*:: as any*/),
              (v2/*:: as any*/),
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "HomeRecruitApplicationSection",
                "kind": "LinkedField",
                "name": "myApplicationSection",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RecruitApplication",
                    "kind": "LinkedField",
                    "name": "application",
                    "plural": false,
                    "selections": [
                      (v5/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "applicantName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "message",
                        "storageKey": null
                      },
                      (v6/*:: as any*/),
                      (v7/*:: as any*/),
                      (v8/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "reviewedByName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "reviewedAtText",
                        "storageKey": null
                      }
                    ],
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
            "concreteType": "HomeRecruitNewcomer",
            "kind": "LinkedField",
            "name": "myNewcomer",
            "plural": true,
            "selections": [
              (v1/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "guildName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "NewcomerChecklist",
                "kind": "LinkedField",
                "name": "checklist",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "progressText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "NewcomerChecklistItem",
                    "kind": "LinkedField",
                    "name": "items",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "key",
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
                        "name": "hint",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "done",
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
                "concreteType": "MentorPairing",
                "kind": "LinkedField",
                "name": "myPairings",
                "plural": true,
                "selections": [
                  (v5/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mentorName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "menteeName",
                    "storageKey": null
                  },
                  (v6/*:: as any*/),
                  (v7/*:: as any*/),
                  (v8/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endedAtText",
                    "storageKey": null
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsViewerQuery",
    "selections": (v9/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsViewerQuery",
    "selections": (v9/*:: as any*/)
  },
  "params": {
    "cacheID": "9619d14bb4d0548079db813150bb0ba8",
    "id": null,
    "metadata": {},
    "name": "documentsViewerQuery",
    "operationKind": "query",
    "text": "query documentsViewerQuery {\n  viewer {\n    myLocalePref\n    commonUnknownErrorText\n    commonRenderErrorTemplate\n    commonRenderErrorHint\n    siteTitle\n    siteSubtitle\n    loginCardTitle\n    loginCardBody1\n    loginCardBody2\n    loginButtonLabel\n    loginPrivacyText\n    footerDisclaimerText\n    footerTermsLabel\n    footerPrivacyLabel\n    userBarSettingsLabel\n    userBarLogoutLabel\n    userBarLoggingOutLabel\n    pickerMyGuildsLabel\n    pickerMyGuildsEnLabel\n    pickerPublicGuildsLabel\n    pickerPublicGuildsEnLabel\n    pickerReadOnlyBadge\n    pickerEmptyTitle\n    pickerEmptyBody\n    pickerCreateGuildLabel\n    pickerCreateGuildMoreLabel\n    user {\n      name\n      discordId\n      avatar\n    }\n    guilds {\n      slug\n      name\n      slogan\n      gameVersion\n      memberCount\n      avatarUrl\n      viewerNick\n      homeTabTeamLabel\n      homeTabDexLabel\n      homeTabSectLabel\n      homeTabAnnouncementsLabel\n      homeTabScheduleLabel\n      homeInsightsRaceTitle\n      raceSeasonBoard {\n        __typename\n      }\n      pageBackLabel\n    }\n    publicGuilds {\n      slug\n      name\n      slogan\n      gameVersion\n      memberCount\n      avatarUrl\n      viewerNick\n      homeTabTeamLabel\n      homeTabDexLabel\n      homeTabSectLabel\n      homeTabAnnouncementsLabel\n      homeTabScheduleLabel\n      homeInsightsRaceTitle\n      raceSeasonBoard {\n        __typename\n      }\n      pageBackLabel\n    }\n    homeRecruit {\n      directoryTitle\n      newcomerTitle\n      homeBody\n      homeLoginHint\n      applySectionTitle\n      messageLabel\n      messagePlaceholder\n      submitLabel\n      submittingLabel\n      myApplicationTitle\n      pendingHint\n      approvedNextStepText\n      rejectedHint\n      checklistTitle\n      myPairingsTitle\n      pairingMentorRoleLabel\n      pairingMenteeRoleLabel\n      guilds {\n        slug\n        name\n        slogan\n        avatarUrl\n        myApplicationSection {\n          application {\n            id\n            applicantName\n            message\n            status\n            statusLabel\n            createdAtText\n            reviewedByName\n            reviewedAtText\n          }\n        }\n      }\n      myNewcomer {\n        slug\n        guildName\n        checklist {\n          progressText\n          items {\n            key\n            label\n            hint\n            done\n          }\n        }\n        myPairings {\n          id\n          mentorName\n          menteeName\n          status\n          statusLabel\n          createdAtText\n          endedAtText\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d207d05e0e541fccb7f57377520e9c87";

export default node;
