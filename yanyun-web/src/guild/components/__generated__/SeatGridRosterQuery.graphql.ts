/**
 * @generated SignedSource<<9df2c78104a005e7ab30ea9060dcc84b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SeatGridRosterQuery$variables = {
  slug: string;
};
export type SeatGridRosterQuery$data = {
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
export type SeatGridRosterQuery = {
  response: SeatGridRosterQuery$data;
  variables: SeatGridRosterQuery$variables;
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
    "name": "SeatGridRosterQuery",
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
    "name": "SeatGridRosterQuery",
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
    "cacheID": "94f288a17d60d35341720901f132460c",
    "id": null,
    "metadata": {},
    "name": "SeatGridRosterQuery",
    "operationKind": "query",
    "text": "query SeatGridRosterQuery(\n  $slug: String!\n) {\n  viewer {\n    guild(slug: $slug) {\n      __typename\n      ... on Guild {\n        memberRoster {\n          discordId\n          displayName\n          globalName\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "532846f0f15209a082a153826caa2811";

export default node;
