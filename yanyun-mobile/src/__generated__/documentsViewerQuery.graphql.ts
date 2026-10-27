/**
 * @generated SignedSource<<40e95b42f739550786fd04f759f1faa1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
      readonly homeTabDexLabel: string;
      readonly homeTabSectLabel: string;
      readonly homeTabTeamLabel: string;
      readonly memberCount: number;
      readonly name: string | null | undefined;
      readonly pageBackLabel: string;
      readonly slogan: string | null | undefined;
      readonly slug: string;
      readonly viewerNick: string | null | undefined;
    }>;
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
      readonly homeTabDexLabel: string;
      readonly homeTabSectLabel: string;
      readonly homeTabTeamLabel: string;
      readonly memberCount: number;
      readonly name: string | null | undefined;
      readonly pageBackLabel: string;
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
    "name": "pageBackLabel",
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
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsViewerQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "8c5455edbbcb61f11d756e7d74f6b83b",
    "id": null,
    "metadata": {},
    "name": "documentsViewerQuery",
    "operationKind": "query",
    "text": "query documentsViewerQuery {\n  viewer {\n    myLocalePref\n    commonUnknownErrorText\n    commonRenderErrorTemplate\n    commonRenderErrorHint\n    siteTitle\n    siteSubtitle\n    loginCardTitle\n    loginCardBody1\n    loginCardBody2\n    loginButtonLabel\n    loginPrivacyText\n    footerDisclaimerText\n    footerTermsLabel\n    footerPrivacyLabel\n    userBarSettingsLabel\n    userBarLogoutLabel\n    userBarLoggingOutLabel\n    pickerMyGuildsLabel\n    pickerMyGuildsEnLabel\n    pickerPublicGuildsLabel\n    pickerPublicGuildsEnLabel\n    pickerReadOnlyBadge\n    pickerEmptyTitle\n    pickerEmptyBody\n    pickerCreateGuildLabel\n    pickerCreateGuildMoreLabel\n    user {\n      name\n      discordId\n      avatar\n    }\n    guilds {\n      slug\n      name\n      slogan\n      gameVersion\n      memberCount\n      avatarUrl\n      viewerNick\n      homeTabTeamLabel\n      homeTabDexLabel\n      homeTabSectLabel\n      pageBackLabel\n    }\n    publicGuilds {\n      slug\n      name\n      slogan\n      gameVersion\n      memberCount\n      avatarUrl\n      viewerNick\n      homeTabTeamLabel\n      homeTabDexLabel\n      homeTabSectLabel\n      pageBackLabel\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5e606d91a5ddc7f18cadc45e7ae5a155";

export default node;
