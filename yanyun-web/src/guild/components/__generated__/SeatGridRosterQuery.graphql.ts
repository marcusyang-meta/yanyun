/**
 * @generated SignedSource<<7da075b6e8908c050082b17c5b15a839>>
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
      readonly memberRoster: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
        readonly globalName: string | null | undefined;
      }>;
    } | null | undefined;
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
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "slug",
            "variableName": "slug"
          }
        ],
        "concreteType": "Guild",
        "kind": "LinkedField",
        "name": "guild",
        "plural": false,
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
    "name": "SeatGridRosterQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SeatGridRosterQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "9c64d0608bfc1432338c29a29a6f5a1f",
    "id": null,
    "metadata": {},
    "name": "SeatGridRosterQuery",
    "operationKind": "query",
    "text": "query SeatGridRosterQuery(\n  $slug: String!\n) {\n  viewer {\n    guild(slug: $slug) {\n      memberRoster {\n        discordId\n        displayName\n        globalName\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "532846f0f15209a082a153826caa2811";

export default node;
