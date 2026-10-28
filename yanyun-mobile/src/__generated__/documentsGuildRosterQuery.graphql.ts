/**
 * @generated SignedSource<<e2ece273019175bb41ebca0d02e796ae>>
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
      readonly memberRoster: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
        readonly globalName: string | null | undefined;
      }>;
    } | null | undefined;
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
    "name": "documentsGuildRosterQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGuildRosterQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "f03c59f73a54c9e693973ac0603edb0d",
    "id": null,
    "metadata": {},
    "name": "documentsGuildRosterQuery",
    "operationKind": "query",
    "text": "query documentsGuildRosterQuery(\n  $slug: String!\n) {\n  viewer {\n    guild(slug: $slug) {\n      memberRoster {\n        discordId\n        displayName\n        globalName\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b6dd5e310a200e12cc551a9ab8575765";

export default node;
