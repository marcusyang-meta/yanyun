/**
 * @generated SignedSource<<fa3d384b2101c69590b3a2a02037f627>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsProfilePageQuery$variables = Record<PropertyKey, never>;
export type documentsProfilePageQuery$data = {
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
    readonly availabilityTitle: string;
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
    readonly feedbackEntryLabel: string;
    readonly freshAuthAt: number | null | undefined;
    readonly localePref: string | null | undefined;
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
    readonly settingsThemeClassicLabel: string;
    readonly settingsThemeGlassLabel: string;
    readonly settingsThemeHint: string;
    readonly settingsThemeLabel: string;
    readonly settingsTitle: string;
    readonly themePref: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly footerDisclaimerText: string;
    readonly footerPrivacyLabel: string;
    readonly footerTermsLabel: string;
    readonly userBarLoggingOutLabel: string;
    readonly userBarLogoutLabel: string;
  };
};
export type documentsProfilePageQuery = {
  response: documentsProfilePageQuery$data;
  variables: documentsProfilePageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
        "name": "commonUnknownErrorText",
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
        "name": "settingsThemeLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsThemeHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsThemeClassicLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "settingsThemeGlassLabel",
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
        "name": "availabilityTitle",
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
        "name": "themePref",
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
    "name": "documentsProfilePageQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsProfilePageQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "0cfd4cb45b8cbf189d9e89ccb9d9290f",
    "id": null,
    "metadata": {},
    "name": "documentsProfilePageQuery",
    "operationKind": "query",
    "text": "query documentsProfilePageQuery {\n  viewer {\n    userBarLogoutLabel\n    userBarLoggingOutLabel\n    commonUnknownErrorText\n    footerDisclaimerText\n    footerTermsLabel\n    footerPrivacyLabel\n  }\n  settingsPage {\n    settingsTitle\n    settingsDiscordLabel\n    settingsLanguageLabel\n    settingsLanguageHint\n    settingsAutoLabel\n    settingsLangZhCnLabel\n    settingsLangZhTwLabel\n    settingsLangEnLabel\n    settingsLangEsLabel\n    settingsLangFrLabel\n    settingsSavedText\n    settingsThemeLabel\n    settingsThemeHint\n    settingsThemeClassicLabel\n    settingsThemeGlassLabel\n    feedbackEntryLabel\n    availabilityTitle\n    localePref\n    effectiveLocale\n    themePref\n    accountSectionTitle\n    accountExportLabel\n    accountExportHint\n    accountDeleteLabel\n    accountDeleteHint\n    accountReauthLabel\n    accountReauthHint\n    accountConfirmTitle\n    accountConfirmIntro\n    accountConsequenceCars\n    accountConsequenceData\n    accountConsequenceGuilds\n    accountConsequenceResidual\n    accountConsequenceReregister\n    accountExportFirstHint\n    accountUsernameLabel\n    accountSubmitLabel\n    accountBackLabel\n    accountCancelDeletionLabel\n    accountDeletionRequestedText\n    accountDeletionCancelledText\n    freshAuthAt\n    accountPendingDeletion {\n      executesAt\n      daysLeft\n      accountPendingTitle\n      accountPendingBody\n    }\n    calendarFeed {\n      calendarSectionTitle\n      calendarHintText\n      calendarUrl\n      calendarCopyLabel\n      calendarCopiedText\n      calendarResetLabel\n      calendarResetDoneText\n    }\n  }\n  gradPage {\n    gearMyLibTitle\n  }\n}\n"
  }
};
})();

(node as any).hash = "436f61d0af16387e1d4056cffdd7fe6e";

export default node;
