/**
 * @generated SignedSource<<37ecc66061887a66109c065753cdc266>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsSchedulePageQuery$variables = {
  slug: string;
};
export type documentsSchedulePageQuery$data = {
  readonly guildSchedulePage: {
    readonly availabilitySummary: ReadonlyArray<{
      readonly discordId: string;
      readonly displayName: string;
      readonly slots: ReadonlyArray<{
        readonly endMinute: number;
        readonly startMinute: number;
        readonly weekday: number;
      }>;
    }> | null | undefined;
    readonly formCancelLabel: string;
    readonly formCapacityTemplate: string;
    readonly formCreateTitle: string;
    readonly formCustomFieldAddLabel: string;
    readonly formCustomFieldEmptyText: string;
    readonly formCustomFieldLabelPlaceholder: string;
    readonly formCustomFieldOptionsPlaceholder: string;
    readonly formCustomFieldRemoveLabel: string;
    readonly formCustomFieldRequiredLabel: string;
    readonly formCustomFieldTypeChoice: string;
    readonly formCustomFieldTypeText: string;
    readonly formCustomFieldsTitle: string;
    readonly formDayTemplate: string;
    readonly formDungeonLabel: string;
    readonly formDungeonNoneLabel: string;
    readonly formEditTitle: string;
    readonly formHintActivity: string;
    readonly formHintDungeonTemplate: string;
    readonly formHintExplore: string;
    readonly formHintRace: string;
    readonly formHintTalent: string;
    readonly formHintTower: string;
    readonly formHourTemplate: string;
    readonly formMinuteTemplate: string;
    readonly formMonthTemplate: string;
    readonly formNicknameLabel: string;
    readonly formNicknamePlaceholder: string;
    readonly formSectLabel: string;
    readonly formSizeLabel: string;
    readonly formSizeOptionTemplate: string;
    readonly formStartsLabel: string;
    readonly formSubmitCreateLabel: string;
    readonly formSubmitEditLabel: string;
    readonly formSubmittingLabel: string;
    readonly formTitleLabel: string;
    readonly formTitlePlaceholder: string;
    readonly formTitleTemplate: string;
    readonly formToastCreateFailedTemplate: string;
    readonly formToastPosted: string;
    readonly formToastSaveFailedTemplate: string;
    readonly formToastSaved: string;
    readonly formToastSect: string;
    readonly formTypeActivityLabel: string;
    readonly formTypeExploreLabel: string;
    readonly formTypeLabel: string;
    readonly formTypeRaceLabel: string;
    readonly formTypeTalentLabel: string;
    readonly formTypeTowerLabel: string;
    readonly formTzEastLabel: string;
    readonly formTzEchoTemplate: string;
    readonly formTzWestLabel: string;
    readonly polls: ReadonlyArray<{
      readonly closeActions: {
        readonly closeLabel: string;
      } | null | undefined;
      readonly createdAtText: string;
      readonly creatorName: string | null | undefined;
      readonly id: string;
      readonly launchActions: {
        readonly launchLabel: string;
      } | null | undefined;
      readonly myOptionIds: ReadonlyArray<string>;
      readonly options: ReadonlyArray<{
        readonly id: string;
        readonly startsAtText: string;
        readonly startsAtUtc: number;
        readonly voteCount: number;
        readonly votedByMe: boolean;
        readonly voterNames: ReadonlyArray<string>;
      }>;
      readonly status: string;
      readonly title: string;
    }>;
    readonly scheduleMyTitle: string;
    readonly schedulePollAddCandidateLabel: string;
    readonly schedulePollCancelLabel: string;
    readonly schedulePollCandidatesLabel: string;
    readonly schedulePollCloseLabel: string;
    readonly schedulePollCreateLabel: string;
    readonly schedulePollEmptyText: string;
    readonly schedulePollLaunchLabel: string;
    readonly schedulePollStatusClosedText: string;
    readonly schedulePollStatusOpenText: string;
    readonly schedulePollSubmitLabel: string;
    readonly schedulePollTitleLabel: string;
    readonly schedulePollTitlePlaceholder: string;
    readonly schedulePollVoteCountTemplate: string;
    readonly schedulePollVoteLabel: string;
    readonly schedulePollVotedText: string;
    readonly schedulePollsHint: string;
    readonly schedulePollsTitle: string;
    readonly scheduleRemoveLabel: string;
    readonly scheduleSettingsLinkLabel: string;
    readonly scheduleSlotRangeTemplate: string;
    readonly scheduleSummaryEmptyText: string;
    readonly scheduleSummaryHint: string;
    readonly scheduleSummaryTitle: string;
    readonly scheduleTitle: string;
    readonly scheduleToastClosed: string;
    readonly scheduleToastFailedTemplate: string;
    readonly scheduleToastPollCreated: string;
    readonly scheduleToastVoted: string;
    readonly slug: string;
    readonly typeShortActivity: string;
    readonly typeShortCoopExplore: string;
    readonly typeShortRace: string;
    readonly typeShortTalent: string;
    readonly typeShortTower: string;
    readonly weekdayNames: ReadonlyArray<string>;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
  };
};
export type documentsSchedulePageQuery = {
  response: documentsSchedulePageQuery$data;
  variables: documentsSchedulePageQuery$variables;
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
  "name": "id",
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
        "args": null,
        "kind": "ScalarField",
        "name": "commonUnknownErrorText",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GuildSchedulePage",
    "kind": "LinkedField",
    "name": "guildSchedulePage",
    "plural": false,
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
        "name": "weekdayNames",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "MemberAvailabilitySummary",
        "kind": "LinkedField",
        "name": "availabilitySummary",
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
        "concreteType": "TimePoll",
        "kind": "LinkedField",
        "name": "polls",
        "plural": true,
        "selections": [
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "creatorName",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAtText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "myOptionIds",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TimePollOption",
            "kind": "LinkedField",
            "name": "options",
            "plural": true,
            "selections": [
              (v1/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "startsAtUtc",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "startsAtText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "voteCount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "voterNames",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "votedByMe",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TimePollCloseActions",
            "kind": "LinkedField",
            "name": "closeActions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "closeLabel",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TimePollLaunchActions",
            "kind": "LinkedField",
            "name": "launchActions",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "launchLabel",
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
        "kind": "ScalarField",
        "name": "formCreateTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formEditTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeActivityLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeTalentLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeRaceLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeTowerLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeExploreLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCapacityTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintActivity",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintDungeonTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintTalent",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintRace",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintTower",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintExplore",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSizeLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSizeOptionTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTitleLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTitlePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formStartsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formMonthTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formDayTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHourTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formMinuteTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTzEastLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTzWestLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTzEchoTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formDungeonLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formDungeonNoneLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formNicknameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formNicknamePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSectLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCancelLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSubmitCreateLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSubmitEditLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSubmittingLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastSect",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastSaved",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastSaveFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastPosted",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastCreateFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTitleTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldsTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldAddLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldLabelPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldTypeText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldTypeChoice",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldOptionsPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldRequiredLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldRemoveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortActivity",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortTalent",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortRace",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortTower",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortCoopExplore",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleMyTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleSlotRangeTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleRemoveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleSettingsLinkLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleSummaryTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleSummaryHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleSummaryEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollsTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollsHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollCreateLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollTitleLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollTitlePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollCandidatesLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollAddCandidateLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollSubmitLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollVoteLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollVotedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollStatusOpenText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollStatusClosedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollCloseLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollVoteCountTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollLaunchLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "schedulePollCancelLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleToastPollCreated",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleToastVoted",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleToastClosed",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scheduleToastFailedTemplate",
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
    "name": "documentsSchedulePageQuery",
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsSchedulePageQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "ee298d219a99dda5bf94533facf0b61a",
    "id": null,
    "metadata": {},
    "name": "documentsSchedulePageQuery",
    "operationKind": "query",
    "text": "query documentsSchedulePageQuery(\n  $slug: String!\n) {\n  viewer {\n    commonUnknownErrorText\n  }\n  guildSchedulePage(slug: $slug) {\n    slug\n    weekdayNames\n    availabilitySummary {\n      discordId\n      displayName\n      slots {\n        weekday\n        startMinute\n        endMinute\n      }\n    }\n    polls {\n      id\n      title\n      status\n      creatorName\n      createdAtText\n      myOptionIds\n      options {\n        id\n        startsAtUtc\n        startsAtText\n        voteCount\n        voterNames\n        votedByMe\n      }\n      closeActions {\n        closeLabel\n      }\n      launchActions {\n        launchLabel\n      }\n    }\n    formCreateTitle\n    formEditTitle\n    formTypeLabel\n    formTypeActivityLabel\n    formTypeTalentLabel\n    formTypeRaceLabel\n    formTypeTowerLabel\n    formTypeExploreLabel\n    formCapacityTemplate\n    formHintActivity\n    formHintDungeonTemplate\n    formHintTalent\n    formHintRace\n    formHintTower\n    formHintExplore\n    formSizeLabel\n    formSizeOptionTemplate\n    formTitleLabel\n    formTitlePlaceholder\n    formStartsLabel\n    formMonthTemplate\n    formDayTemplate\n    formHourTemplate\n    formMinuteTemplate\n    formTzEastLabel\n    formTzWestLabel\n    formTzEchoTemplate\n    formDungeonLabel\n    formDungeonNoneLabel\n    formNicknameLabel\n    formNicknamePlaceholder\n    formSectLabel\n    formCancelLabel\n    formSubmitCreateLabel\n    formSubmitEditLabel\n    formSubmittingLabel\n    formToastSect\n    formToastSaved\n    formToastSaveFailedTemplate\n    formToastPosted\n    formToastCreateFailedTemplate\n    formTitleTemplate\n    formCustomFieldsTitle\n    formCustomFieldAddLabel\n    formCustomFieldLabelPlaceholder\n    formCustomFieldTypeText\n    formCustomFieldTypeChoice\n    formCustomFieldOptionsPlaceholder\n    formCustomFieldRequiredLabel\n    formCustomFieldRemoveLabel\n    formCustomFieldEmptyText\n    typeShortActivity\n    typeShortTalent\n    typeShortRace\n    typeShortTower\n    typeShortCoopExplore\n    scheduleTitle\n    scheduleMyTitle\n    scheduleSlotRangeTemplate\n    scheduleRemoveLabel\n    scheduleSettingsLinkLabel\n    scheduleSummaryTitle\n    scheduleSummaryHint\n    scheduleSummaryEmptyText\n    schedulePollsTitle\n    schedulePollsHint\n    schedulePollEmptyText\n    schedulePollCreateLabel\n    schedulePollTitleLabel\n    schedulePollTitlePlaceholder\n    schedulePollCandidatesLabel\n    schedulePollAddCandidateLabel\n    schedulePollSubmitLabel\n    schedulePollVoteLabel\n    schedulePollVotedText\n    schedulePollStatusOpenText\n    schedulePollStatusClosedText\n    schedulePollCloseLabel\n    schedulePollVoteCountTemplate\n    schedulePollLaunchLabel\n    schedulePollCancelLabel\n    scheduleToastPollCreated\n    scheduleToastVoted\n    scheduleToastClosed\n    scheduleToastFailedTemplate\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b4a4a3b20fd3534c4475b814ce0e0d9";

export default node;
