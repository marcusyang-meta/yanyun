/**
 * @generated SignedSource<<6cde45d3485872f874028e09be3034ea>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
  };
};
export type SettingsDialogQuery = {
  response: SettingsDialogQuery$data;
  variables: SettingsDialogQuery$variables;
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
        "name": "commonUnknownErrorText",
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
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SettingsDialogQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "75abfcba8825618354b939392b6998bc",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogQuery",
    "operationKind": "query",
    "text": "query SettingsDialogQuery {\n  viewer {\n    commonUnknownErrorText\n  }\n  settingsPage {\n    settingsTitle\n    settingsDiscordLabel\n    settingsLanguageLabel\n    settingsLanguageHint\n    settingsAutoLabel\n    settingsLangZhCnLabel\n    settingsLangZhTwLabel\n    settingsLangEnLabel\n    settingsLangEsLabel\n    settingsLangFrLabel\n    settingsSavedText\n    feedbackEntryLabel\n    feedbackTitle\n    feedbackCategoryLabel\n    feedbackCategoryProblemLabel\n    feedbackCategorySuggestionLabel\n    feedbackCategoryOtherLabel\n    feedbackPlaceholder\n    feedbackSubmitLabel\n    feedbackSubmittingLabel\n    feedbackSuccessText\n    localePref\n    effectiveLocale\n    accountSectionTitle\n    accountExportLabel\n    accountExportHint\n    accountDeleteLabel\n    accountDeleteHint\n    accountReauthLabel\n    accountReauthHint\n    accountConfirmTitle\n    accountConfirmIntro\n    accountConsequenceCars\n    accountConsequenceData\n    accountConsequenceGuilds\n    accountConsequenceResidual\n    accountConsequenceReregister\n    accountExportFirstHint\n    accountUsernameLabel\n    accountSubmitLabel\n    accountBackLabel\n    accountCancelDeletionLabel\n    accountDeletionRequestedText\n    accountDeletionCancelledText\n    freshAuthAt\n    accountPendingDeletion {\n      executesAt\n      daysLeft\n      accountPendingTitle\n      accountPendingBody\n    }\n  }\n  gradPage {\n    gearMyLibTitle\n  }\n}\n"
  }
};
})();

(node as any).hash = "f61affd8aa70ad68cde6aa00c957a92a";

export default node;
