/**
 * @generated SignedSource<<d2528268e4d27dd26cd8d226467735e7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SeasonGoalStatus = "ACTIVE" | "DONE" | "DROPPED" | "%future added value";
export type SettingsDialogQuery$variables = Record<PropertyKey, never>;
export type SettingsDialogQuery$data = {
  readonly gradPage: {
    readonly gearMyLibTitle: string;
  };
  readonly settingsPage: {
    readonly accountBackLabel: string;
    readonly accountCancelDeletionLabel: string;
    readonly accountConfirmIntro: string;
    readonly accountConfirmTitle: string;
    readonly accountConsequenceCars: string;
    readonly accountConsequenceData: string;
    readonly accountConsequenceGuilds: string;
    readonly accountConsequenceReregister: string;
    readonly accountConsequenceResidual: string;
    readonly accountDeleteHint: string;
    readonly accountDeleteLabel: string;
    readonly accountDeletionCancelledText: string;
    readonly accountDeletionRequestedText: string;
    readonly accountExportFirstHint: string;
    readonly accountExportHint: string;
    readonly accountExportLabel: string;
    readonly accountPendingDeletion: {
      readonly accountPendingBody: string;
      readonly accountPendingTitle: string;
      readonly daysLeft: number;
      readonly executesAt: string;
    } | null | undefined;
    readonly accountReauthHint: string;
    readonly accountReauthLabel: string;
    readonly accountSectionTitle: string;
    readonly accountSubmitLabel: string;
    readonly accountUsernameLabel: string;
    readonly agentGrants: {
      readonly agentEmptyText: string;
      readonly agentHintText: string;
      readonly agentRevokeDoneText: string;
      readonly agentSectionTitle: string;
      readonly grants: ReadonlyArray<{
        readonly clientName: string;
        readonly createdText: string;
        readonly id: string;
        readonly lastUsedText: string;
        readonly name: string;
        readonly revokeLabel: string;
        readonly scopesLabel: string;
        readonly sourceLabel: string;
        readonly tokenPrefix: string;
      }>;
    } | null | undefined;
    readonly availabilityAddSlotLabel: string;
    readonly availabilityEmptyText: string;
    readonly availabilityGuilds: ReadonlyArray<{
      readonly guildName: string;
      readonly slots: ReadonlyArray<{
        readonly endMinute: number;
        readonly startMinute: number;
        readonly weekday: number;
      }>;
      readonly slug: string;
    }>;
    readonly availabilityHint: string;
    readonly availabilityNoGuildsText: string;
    readonly availabilityRemoveLabel: string;
    readonly availabilitySaveFailedTemplate: string;
    readonly availabilitySaveLabel: string;
    readonly availabilitySavedText: string;
    readonly availabilityTitle: string;
    readonly availabilityWeekdayNames: ReadonlyArray<string>;
    readonly calendarFeed: {
      readonly calendarCopiedText: string;
      readonly calendarCopyLabel: string;
      readonly calendarHintText: string;
      readonly calendarResetDoneText: string;
      readonly calendarResetLabel: string;
      readonly calendarSectionTitle: string;
      readonly calendarUrl: string;
    } | null | undefined;
    readonly effectiveLocale: string;
    readonly feedbackCategoryLabel: string;
    readonly feedbackCategoryOtherLabel: string;
    readonly feedbackCategoryProblemLabel: string;
    readonly feedbackCategorySuggestionLabel: string;
    readonly feedbackEntryLabel: string;
    readonly feedbackPlaceholder: string;
    readonly feedbackSubmitLabel: string;
    readonly feedbackSubmittingLabel: string;
    readonly feedbackSuccessText: string;
    readonly feedbackTitle: string;
    readonly freshAuthAt: number | null | undefined;
    readonly localePref: string | null | undefined;
    readonly seasonGoals: {
      readonly addLabel: string;
      readonly deleteLabel: string;
      readonly dungeonLabel: string;
      readonly dungeonNoneLabel: string;
      readonly dungeonOptions: ReadonlyArray<{
        readonly id: number;
        readonly name: string;
        readonly seasonName: string | null | undefined;
      }>;
      readonly editLabel: string;
      readonly emptyText: string;
      readonly entryLabel: string;
      readonly goalNoteLabel: string;
      readonly goalNotePlaceholder: string;
      readonly goalTitleLabel: string;
      readonly goalTitlePlaceholder: string;
      readonly goals: ReadonlyArray<{
        readonly dungeonId: number | null | undefined;
        readonly dungeonName: string | null | undefined;
        readonly guildName: string;
        readonly guildSlug: string;
        readonly id: string;
        readonly note: string;
        readonly seasonName: string | null | undefined;
        readonly status: SeasonGoalStatus;
        readonly statusLabel: string;
        readonly title: string;
      }>;
      readonly guildLabel: string;
      readonly guildOptions: ReadonlyArray<{
        readonly name: string;
        readonly slug: string;
      }>;
      readonly hint: string;
      readonly saveLabel: string;
      readonly statusActiveLabel: string;
      readonly statusDoneLabel: string;
      readonly statusDroppedLabel: string;
      readonly statusLabel: string;
      readonly title: string;
    };
    readonly settingsAutoLabel: string;
    readonly settingsDiscordLabel: string;
    readonly settingsLangEnLabel: string;
    readonly settingsLangEsLabel: string;
    readonly settingsLangFrLabel: string;
    readonly settingsLangZhCnLabel: string;
    readonly settingsLangZhTwLabel: string;
    readonly settingsLanguageHint: string;
    readonly settingsLanguageLabel: string;
    readonly settingsSavedText: string;
    readonly settingsTitle: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly platformAdmin: {
      readonly __typename: string;
    };
  };
};
export type SettingsDialogQuery = {
  response: SettingsDialogQuery$data;
  variables: SettingsDialogQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusLabel",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "guildName",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seasonName",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = [
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
        "name": "commonUnknownErrorText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "platformAdmin",
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
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "SettingsPage",
    "kind": "LinkedField",
    "name": "settingsPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsDiscordLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLanguageLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLanguageHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsAutoLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangZhCnLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangZhTwLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangEnLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangEsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsLangFrLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsSavedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackEntryLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackCategoryLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackCategoryProblemLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackCategorySuggestionLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackCategoryOtherLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackSubmitLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackSubmittingLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackSuccessText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "localePref",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "effectiveLocale",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountSectionTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountExportLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountExportHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountDeleteLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountDeleteHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountReauthLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountReauthHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountConfirmTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountConfirmIntro",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountConsequenceCars",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountConsequenceData",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountConsequenceGuilds",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountConsequenceResidual",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountConsequenceReregister",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountExportFirstHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountUsernameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountSubmitLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountBackLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountCancelDeletionLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountDeletionRequestedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accountDeletionCancelledText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "freshAuthAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "MySeasonGoalPage",
        "kind": "LinkedField",
        "name": "seasonGoals",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "entryLabel",
            "storageKey": null
          },
          (v0/*:: as any*/),
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
            "name": "emptyText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "guildLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "goalTitleLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "goalTitlePlaceholder",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "goalNoteLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "goalNotePlaceholder",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dungeonLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dungeonNoneLabel",
            "storageKey": null
          },
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "addLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "saveLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "editLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "deleteLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "statusActiveLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "statusDoneLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "statusDroppedLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "MemberSeasonGoal",
            "kind": "LinkedField",
            "name": "goals",
            "plural": true,
            "selections": [
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "guildSlug",
                "storageKey": null
              },
              (v3/*:: as any*/),
              (v0/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "note",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "status",
                "storageKey": null
              },
              (v1/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dungeonId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dungeonName",
                "storageKey": null
              },
              (v4/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "SeasonGoalGuildOption",
            "kind": "LinkedField",
            "name": "guildOptions",
            "plural": true,
            "selections": [
              (v5/*:: as any*/),
              (v6/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "SeasonGoalDungeonOption",
            "kind": "LinkedField",
            "name": "dungeonOptions",
            "plural": true,
            "selections": [
              (v2/*:: as any*/),
              (v6/*:: as any*/),
              (v4/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "AccountPendingDeletion",
        "kind": "LinkedField",
        "name": "accountPendingDeletion",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "executesAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "daysLeft",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "accountPendingTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "accountPendingBody",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityWeekdayNames",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityAddSlotLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityRemoveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilitySaveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilitySavedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilitySaveFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityNoGuildsText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "SettingsAvailabilityGuild",
        "kind": "LinkedField",
        "name": "availabilityGuilds",
        "plural": true,
        "selections": [
          (v5/*:: as any*/),
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "AvailabilitySlot",
            "kind": "LinkedField",
            "name": "slots",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "weekday",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "startMinute",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endMinute",
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
        "concreteType": "CalendarFeedSettings",
        "kind": "LinkedField",
        "name": "calendarFeed",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "calendarSectionTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "calendarHintText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "calendarUrl",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "calendarCopyLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "calendarCopiedText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "calendarResetLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "calendarResetDoneText",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "AgentGrantsSettings",
        "kind": "LinkedField",
        "name": "agentGrants",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "agentSectionTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "agentHintText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "agentEmptyText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "agentRevokeDoneText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "AgentGrant",
            "kind": "LinkedField",
            "name": "grants",
            "plural": true,
            "selections": [
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "clientName",
                "storageKey": null
              },
              (v6/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "scopesLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "sourceLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tokenPrefix",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "createdText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lastUsedText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "revokeLabel",
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
    "concreteType": "GradPage",
    "kind": "LinkedField",
    "name": "gradPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearMyLibTitle",
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
    "name": "SettingsDialogQuery",
    "selections": (v7/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SettingsDialogQuery",
    "selections": (v7/*:: as any*/)
  },
  "params": {
    "cacheID": "c02c70382f7574b84fbfd01339831148",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogQuery",
    "operationKind": "query",
    "text": "query SettingsDialogQuery {\n  viewer {\n    commonUnknownErrorText\n    platformAdmin {\n      __typename\n    }\n  }\n  settingsPage {\n    settingsTitle\n    settingsDiscordLabel\n    settingsLanguageLabel\n    settingsLanguageHint\n    settingsAutoLabel\n    settingsLangZhCnLabel\n    settingsLangZhTwLabel\n    settingsLangEnLabel\n    settingsLangEsLabel\n    settingsLangFrLabel\n    settingsSavedText\n    feedbackEntryLabel\n    feedbackTitle\n    feedbackCategoryLabel\n    feedbackCategoryProblemLabel\n    feedbackCategorySuggestionLabel\n    feedbackCategoryOtherLabel\n    feedbackPlaceholder\n    feedbackSubmitLabel\n    feedbackSubmittingLabel\n    feedbackSuccessText\n    localePref\n    effectiveLocale\n    accountSectionTitle\n    accountExportLabel\n    accountExportHint\n    accountDeleteLabel\n    accountDeleteHint\n    accountReauthLabel\n    accountReauthHint\n    accountConfirmTitle\n    accountConfirmIntro\n    accountConsequenceCars\n    accountConsequenceData\n    accountConsequenceGuilds\n    accountConsequenceResidual\n    accountConsequenceReregister\n    accountExportFirstHint\n    accountUsernameLabel\n    accountSubmitLabel\n    accountBackLabel\n    accountCancelDeletionLabel\n    accountDeletionRequestedText\n    accountDeletionCancelledText\n    freshAuthAt\n    seasonGoals {\n      entryLabel\n      title\n      hint\n      emptyText\n      guildLabel\n      goalTitleLabel\n      goalTitlePlaceholder\n      goalNoteLabel\n      goalNotePlaceholder\n      dungeonLabel\n      dungeonNoneLabel\n      statusLabel\n      addLabel\n      saveLabel\n      editLabel\n      deleteLabel\n      statusActiveLabel\n      statusDoneLabel\n      statusDroppedLabel\n      goals {\n        id\n        guildSlug\n        guildName\n        title\n        note\n        status\n        statusLabel\n        dungeonId\n        dungeonName\n        seasonName\n      }\n      guildOptions {\n        slug\n        name\n      }\n      dungeonOptions {\n        id\n        name\n        seasonName\n      }\n    }\n    accountPendingDeletion {\n      executesAt\n      daysLeft\n      accountPendingTitle\n      accountPendingBody\n    }\n    availabilityTitle\n    availabilityHint\n    availabilityWeekdayNames\n    availabilityAddSlotLabel\n    availabilityRemoveLabel\n    availabilitySaveLabel\n    availabilitySavedText\n    availabilitySaveFailedTemplate\n    availabilityEmptyText\n    availabilityNoGuildsText\n    availabilityGuilds {\n      slug\n      guildName\n      slots {\n        weekday\n        startMinute\n        endMinute\n      }\n    }\n    calendarFeed {\n      calendarSectionTitle\n      calendarHintText\n      calendarUrl\n      calendarCopyLabel\n      calendarCopiedText\n      calendarResetLabel\n      calendarResetDoneText\n    }\n    agentGrants {\n      agentSectionTitle\n      agentHintText\n      agentEmptyText\n      agentRevokeDoneText\n      grants {\n        id\n        clientName\n        name\n        scopesLabel\n        sourceLabel\n        tokenPrefix\n        createdText\n        lastUsedText\n        revokeLabel\n      }\n    }\n  }\n  gradPage {\n    gearMyLibTitle\n  }\n}\n"
  }
};
})();

(node as any).hash = "948eeea9a0b47d24d317575b27018222";

export default node;
