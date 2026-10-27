/**
 * @generated SignedSource<<1d12e609b4d5f788a2fc836bf1dc1554>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppViewerQuery$variables = Record<PropertyKey, never>;
export type AppViewerQuery$data = {
  readonly viewer: {
    readonly footerDisclaimerText: string;
    readonly footerPrivacyLabel: string;
    readonly footerTermsLabel: string;
    readonly guilds: ReadonlyArray<{
      readonly avatarUrl: string | null | undefined;
      readonly gameVersion: string;
      readonly memberCount: number;
      readonly name: string | null | undefined;
      readonly slogan: string | null | undefined;
      readonly slug: string;
    }>;
    readonly landingDexBody: string;
    readonly landingDexTitle: string;
    readonly landingFeaturesTitle: string;
    readonly landingGearBody: string;
    readonly landingGearTitle: string;
    readonly landingGroupingBody: string;
    readonly landingGroupingTitle: string;
    readonly landingReminderBody: string;
    readonly landingReminderTitle: string;
    readonly loginButtonLabel: string;
    readonly loginCardBody1: string;
    readonly loginCardBody2: string;
    readonly loginCardTitle: string;
    readonly loginPrivacyText: string;
    readonly myEffectiveLocale: string;
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
      readonly memberCount: number;
      readonly name: string | null | undefined;
      readonly slogan: string | null | undefined;
      readonly slug: string;
    }>;
    readonly siteHeroAlt: string;
    readonly siteSealText: string;
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
export type AppViewerQuery = {
  response: AppViewerQuery$data;
  variables: AppViewerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "slug",
    "storageKey": null
  },
  (v0/*:: as any*/),
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
    "name": "memberCount",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "avatarUrl",
    "storageKey": null
  }
],
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
          (v0/*:: as any*/),
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
        "selections": (v1/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GuildReadOnly",
        "kind": "LinkedField",
        "name": "publicGuilds",
        "plural": true,
        "selections": (v1/*:: as any*/),
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
        "name": "siteHeroAlt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "siteSealText",
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
        "name": "landingFeaturesTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "landingGroupingTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "landingGroupingBody",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "landingReminderTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "landingReminderBody",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "landingDexTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "landingDexBody",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "landingGearTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "landingGearBody",
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
        "name": "userBarSettingsLabel",
        "storageKey": null
      },
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
        "name": "myEffectiveLocale",
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
    "name": "AppViewerQuery",
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AppViewerQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "eadc6ea2d988d7bd094e749beedab7da",
    "id": null,
    "metadata": {},
    "name": "AppViewerQuery",
    "operationKind": "query",
    "text": "query AppViewerQuery {\n  viewer {\n    user {\n      discordId\n      name\n      avatar\n    }\n    guilds {\n      slug\n      name\n      slogan\n      gameVersion\n      memberCount\n      avatarUrl\n    }\n    publicGuilds {\n      slug\n      name\n      slogan\n      gameVersion\n      memberCount\n      avatarUrl\n    }\n    siteTitle\n    siteSubtitle\n    siteHeroAlt\n    siteSealText\n    loginCardTitle\n    loginCardBody1\n    loginCardBody2\n    loginButtonLabel\n    loginPrivacyText\n    landingFeaturesTitle\n    landingGroupingTitle\n    landingGroupingBody\n    landingReminderTitle\n    landingReminderBody\n    landingDexTitle\n    landingDexBody\n    landingGearTitle\n    landingGearBody\n    footerDisclaimerText\n    footerTermsLabel\n    footerPrivacyLabel\n    userBarLogoutLabel\n    userBarLoggingOutLabel\n    userBarSettingsLabel\n    myLocalePref\n    myEffectiveLocale\n    pickerMyGuildsLabel\n    pickerMyGuildsEnLabel\n    pickerPublicGuildsLabel\n    pickerPublicGuildsEnLabel\n    pickerReadOnlyBadge\n    pickerEmptyTitle\n    pickerEmptyBody\n    pickerCreateGuildLabel\n    pickerCreateGuildMoreLabel\n  }\n}\n"
  }
};
})();

(node as any).hash = "37f606984f78d93fd04455ce0c08b343";

export default node;
