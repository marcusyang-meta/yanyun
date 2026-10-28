/**
 * @generated SignedSource<<b75da6fb825b0d168452aedb3147d1d0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CarSharePageQuery$variables = {
  code: string;
};
export type CarSharePageQuery$data = {
  readonly sharedGrouping: {
    readonly dungeonName: string | null | undefined;
    readonly exists: boolean;
    readonly guildName: string | null | undefined;
    readonly maxSlots: number;
    readonly occupiedCount: number;
    readonly seats: ReadonlyArray<{
      readonly index: number;
      readonly occupied: boolean;
    }>;
    readonly shareKicker: string;
    readonly shareLoginLabel: string;
    readonly shareNotFoundBody: string;
    readonly shareNotFoundTitle: string;
    readonly shareOpenLabel: string;
    readonly sharePeopleTemplate: string;
    readonly shareReadonlyHint: string;
    readonly shareSeatsTitle: string;
    readonly shareStatusClosedLabel: string;
    readonly shareStatusCompletedLabel: string;
    readonly shareStatusOpenLabel: string;
    readonly shareTypeLabel: string;
    readonly startsAt: string | null | undefined;
    readonly status: string | null | undefined;
    readonly title: string | null | undefined;
  };
  readonly viewer: {
    readonly user: {
      readonly discordId: string;
    } | null | undefined;
  };
};
export type CarSharePageQuery = {
  response: CarSharePageQuery$data;
  variables: CarSharePageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "code"
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
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "code",
        "variableName": "code"
      }
    ],
    "concreteType": "SharedGroupingPage",
    "kind": "LinkedField",
    "name": "sharedGrouping",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "exists",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "guildName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "title",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dungeonName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "startsAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "status",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "occupiedCount",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "maxSlots",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "SharedGroupingSeat",
        "kind": "LinkedField",
        "name": "seats",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "index",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "occupied",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareKicker",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareLoginLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareOpenLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareNotFoundTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareNotFoundBody",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareReadonlyHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareStatusOpenLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareStatusClosedLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareStatusCompletedLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sharePeopleTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareSeatsTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareTypeLabel",
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
    "name": "CarSharePageQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "CarSharePageQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "fe0dd4909efdd6d51c7dcb9d2d249aea",
    "id": null,
    "metadata": {},
    "name": "CarSharePageQuery",
    "operationKind": "query",
    "text": "query CarSharePageQuery(\n  $code: String!\n) {\n  viewer {\n    user {\n      discordId\n    }\n  }\n  sharedGrouping(code: $code) {\n    exists\n    guildName\n    title\n    dungeonName\n    startsAt\n    status\n    occupiedCount\n    maxSlots\n    seats {\n      index\n      occupied\n    }\n    shareKicker\n    shareLoginLabel\n    shareOpenLabel\n    shareNotFoundTitle\n    shareNotFoundBody\n    shareReadonlyHint\n    shareStatusOpenLabel\n    shareStatusClosedLabel\n    shareStatusCompletedLabel\n    sharePeopleTemplate\n    shareSeatsTitle\n    shareTypeLabel\n  }\n}\n"
  }
};
})();

(node as any).hash = "66f24c4c5578d8a51283d59713f3b486";

export default node;
