/**
 * @generated SignedSource<<1701f65c40cc32bcf4b842b2259e999c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGuildRosterQuery$variables = {
  slug: string;
};
export type documentsGuildRosterQuery$data = {
  readonly viewer: {
    readonly guild: {
      readonly memberRoster?: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
        readonly globalName: string | null | undefined;
      }>;
    };
  };
};
export type documentsGuildRosterQuery = {
  response: documentsGuildRosterQuery$data;
  variables: documentsGuildRosterQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "GuildRosterMember",
      "kind": "LinkedField",
      "name": "memberRoster",
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
          "kind": "ScalarField",
          "name": "globalName",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Guild",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGuildRosterQuery",
    "selections": [
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
            "args": (v1/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              (v2/*:: as any*/)
            ],
            "storageKey": null
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
    "name": "documentsGuildRosterQuery",
    "selections": [
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
            "args": (v1/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v2/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ef9f92e072e70be992cf53dfd4d39e15",
    "id": null,
    "metadata": {},
    "name": "documentsGuildRosterQuery",
    "operationKind": "query",
    "text": "query documentsGuildRosterQuery(\n  $slug: String!\n) {\n  viewer {\n    guild(slug: $slug) {\n      __typename\n      ... on Guild {\n        memberRoster {\n          discordId\n          displayName\n          globalName\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b6dd5e310a200e12cc551a9ab8575765";

export default node;
