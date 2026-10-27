/**
 * @generated SignedSource<<ea9379b2f332decb4edfbd3a0d5cdb01>>
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
    readonly effectiveLocale: string;
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
        "name": "localePref",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "effectiveLocale",
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
    "cacheID": "0a257541148154fb48f67d57938c5768",
    "id": null,
    "metadata": {},
    "name": "documentsProfilePageQuery",
    "operationKind": "query",
    "text": "query documentsProfilePageQuery {\n  viewer {\n    userBarLogoutLabel\n    userBarLoggingOutLabel\n    commonUnknownErrorText\n    footerDisclaimerText\n    footerTermsLabel\n    footerPrivacyLabel\n  }\n  settingsPage {\n    settingsTitle\n    settingsDiscordLabel\n    settingsLanguageLabel\n    settingsLanguageHint\n    settingsAutoLabel\n    settingsLangZhCnLabel\n    settingsLangZhTwLabel\n    settingsLangEnLabel\n    settingsLangEsLabel\n    settingsLangFrLabel\n    settingsSavedText\n    localePref\n    effectiveLocale\n  }\n  gradPage {\n    gearMyLibTitle\n  }\n}\n"
  }
};
})();

(node as any).hash = "f227fcdedbd295fb0988c40800e5143c";

export default node;
