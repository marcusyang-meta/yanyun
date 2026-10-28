/**
 * @generated SignedSource<<184553a9b50f04db5d66603807511e3c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @indirectDataDrivenDependency GuildRecruitRouteRoot_viewer.guildRecruit {"branches":{"GuildRecruitLocked":{"component":"GuildRecruitLockedPage.react","fragment":"GuildRecruitLockedPage_guildRecruit$normalization.graphql"},"GuildRecruitPage":{"component":"GuildRecruitPage.react","fragment":"GuildRecruitPage_guildRecruit$normalization.graphql"}},"plural":false}

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildRecruitRouteQuery$variables = {
  slug: string;
};
export type GuildRecruitRouteQuery$data = {
  readonly viewer: {
    readonly commonCancelLabel: string;
    readonly commonConfirmLabel: string;
    readonly commonLoadingGuildText: string;
    readonly commonUnknownErrorText: string;
    readonly user: {
      readonly avatar: string | null | undefined;
      readonly discordId: string;
      readonly name: string;
    } | null | undefined;
    readonly userBarLoggingOutLabel: string;
    readonly userBarLogoutLabel: string;
    readonly userBarSettingsLabel: string;
    readonly " $fragmentSpreads": FragmentRefs<"GuildRecruitRouteRoot_viewer">;
  };
};
export type GuildRecruitRouteQuery = {
  response: GuildRecruitRouteQuery$data;
  variables: GuildRecruitRouteQuery$variables;
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonConfirmLabel",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonCancelLabel",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonUnknownErrorText",
  "storageKey": null
},
v9 = [
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
    "name": "GuildRecruitRouteQuery",
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
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          {
            "args": (v9/*:: as any*/),
            "kind": "FragmentSpread",
            "name": "GuildRecruitRouteRoot_viewer"
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
    "name": "GuildRecruitRouteQuery",
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
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          {
            "alias": null,
            "args": (v9/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guildRecruit",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "GuildRecruitRouteRoot_viewer",
                    "fragmentName": "GuildRecruitPage_guildRecruit",
                    "fragmentPropName": "guildRecruit",
                    "kind": "ModuleImport",
                    "componentModuleProvider": () => JSResource('m#GuildRecruitPage.react'),
                    "operationModuleProvider": () => JSResource('m#GuildRecruitPage_guildRecruit$normalization.graphql')
                  }
                ],
                "type": "GuildRecruitPage",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "GuildRecruitRouteRoot_viewer",
                    "fragmentName": "GuildRecruitLockedPage_guildRecruit",
                    "fragmentPropName": "guildRecruit",
                    "kind": "ModuleImport",
                    "componentModuleProvider": () => JSResource('m#GuildRecruitLockedPage.react'),
                    "operationModuleProvider": () => JSResource('m#GuildRecruitLockedPage_guildRecruit$normalization.graphql')
                  }
                ],
                "type": "GuildRecruitLocked",
                "abstractKey": null
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
    "cacheID": "bb4902ec95007dc614debccbd62e0ba3",
    "id": null,
    "metadata": {},
    "name": "GuildRecruitRouteQuery",
    "operationKind": "query",
    "text": "query GuildRecruitRouteQuery(\n  $slug: String!\n) {\n  viewer {\n    user {\n      discordId\n      name\n      avatar\n    }\n    userBarLogoutLabel\n    userBarLoggingOutLabel\n    userBarSettingsLabel\n    commonLoadingGuildText\n    commonConfirmLabel\n    commonCancelLabel\n    commonUnknownErrorText\n    ...GuildRecruitRouteRoot_viewer_20J5Pl\n  }\n}\n\nfragment GuildRecruitLockedPage_guildRecruit on GuildRecruitLocked {\n  slug\n  lockedTitle\n  lockedBody\n  backLabel\n}\n\nfragment GuildRecruitPage_guildRecruit on GuildRecruitPage {\n  slug\n  guildName\n  recruitTitle\n  recruitBody\n  applySectionTitle\n  messageLabel\n  messagePlaceholder\n  submitLabel\n  submittingLabel\n  myApplicationTitle\n  pendingHint\n  approvedNextStepText\n  rejectedHint\n  checklistTitle\n  myPairingsTitle\n  pairingMentorRoleLabel\n  pairingMenteeRoleLabel\n  backLabel\n  myApplication {\n    id\n    applicantName\n    message\n    status\n    statusLabel\n    createdAtText\n    reviewedByName\n    reviewedAtText\n  }\n  checklist {\n    progressText\n    items {\n      key\n      label\n      hint\n      done\n    }\n  }\n  myPairings {\n    id\n    mentorName\n    menteeName\n    status\n    statusLabel\n    createdAtText\n    endedAtText\n  }\n}\n\nfragment GuildRecruitRouteRoot_viewer_20J5Pl on Viewer {\n  guildRecruit(slug: $slug) {\n    __typename\n    ... on GuildRecruitPage {\n      ...GuildRecruitPage_guildRecruit\n    }\n    ... on GuildRecruitLocked {\n      ...GuildRecruitLockedPage_guildRecruit\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5ca2375159a7ee2b3e068e043decfb85";

export default node;
