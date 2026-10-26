/**
 * @generated SignedSource<<339af986855a7d1b55d6752a51d605bc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsCreateGuildPageQuery$variables = Record<PropertyKey, never>;
export type documentsCreateGuildPageQuery$data = {
  readonly viewer: {
    readonly createBackLinkLabel: string;
    readonly createNameLabel: string;
    readonly createNamePlaceholder: string;
    readonly createNoServers1: string;
    readonly createNoServers2: string;
    readonly createServerLabel: string;
    readonly createSlugCheckingText: string;
    readonly createSlugLabel: string;
    readonly createSlugNote: string;
    readonly createSlugPlaceholder: string;
    readonly createSlugTakenText: string;
    readonly createSubmitLabel: string;
    readonly createSubmittingLabel: string;
    readonly createSubtitle: string;
    readonly createTitle: string;
    readonly createToastCreated: string;
    readonly createToastFailed: string;
    readonly createToastNameShort: string;
    readonly createToastServerRequired: string;
    readonly createToastSlugBad: string;
    readonly createToastSlugRequired: string;
    readonly discordServers: ReadonlyArray<{
      readonly icon: string | null | undefined;
      readonly id: string;
      readonly name: string;
    }>;
  };
};
export type documentsCreateGuildPageQuery = {
  response: documentsCreateGuildPageQuery$data;
  variables: documentsCreateGuildPageQuery$variables;
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
        "concreteType": "DiscordServer",
        "kind": "LinkedField",
        "name": "discordServers",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
            "name": "icon",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createBackLinkLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createSubtitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createNameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createNamePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createSlugLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createSlugPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createSlugCheckingText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createSlugTakenText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createSlugNote",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createServerLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createNoServers1",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createNoServers2",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createSubmitLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createSubmittingLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createToastNameShort",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createToastSlugRequired",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createToastSlugBad",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createToastServerRequired",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createToastCreated",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createToastFailed",
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
    "name": "documentsCreateGuildPageQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsCreateGuildPageQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "da34bb9a831589c678329639505a9cf5",
    "id": null,
    "metadata": {},
    "name": "documentsCreateGuildPageQuery",
    "operationKind": "query",
    "text": "query documentsCreateGuildPageQuery {\n  viewer {\n    discordServers {\n      id\n      name\n      icon\n    }\n    createBackLinkLabel\n    createTitle\n    createSubtitle\n    createNameLabel\n    createNamePlaceholder\n    createSlugLabel\n    createSlugPlaceholder\n    createSlugCheckingText\n    createSlugTakenText\n    createSlugNote\n    createServerLabel\n    createNoServers1\n    createNoServers2\n    createSubmitLabel\n    createSubmittingLabel\n    createToastNameShort\n    createToastSlugRequired\n    createToastSlugBad\n    createToastServerRequired\n    createToastCreated\n    createToastFailed\n  }\n}\n"
  }
};
})();

(node as any).hash = "2ca50e360120f00eb074ca4332d3302f";

export default node;
