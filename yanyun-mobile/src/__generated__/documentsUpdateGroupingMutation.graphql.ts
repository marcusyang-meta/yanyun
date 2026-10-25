/**
 * @generated SignedSource<<2571c2824bf9f5be01615a43f82b892a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type UpdateGroupingInput = {
  seats?: ReadonlyArray<SeatInput> | null | undefined;
  startsAt?: string | null | undefined;
  title?: string | null | undefined;
};
export type SeatInput = {
  nickname: string;
  weapon: string;
};
export type documentsUpdateGroupingMutation$variables = {
  id: string;
  input: UpdateGroupingInput;
};
export type documentsUpdateGroupingMutation$data = {
  readonly updateGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly dungeon: {
        readonly name: string;
      } | null | undefined;
      readonly id: string;
      readonly maxSlots: number;
      readonly occupiedCount: number;
      readonly seats: ReadonlyArray<{
        readonly index: number;
        readonly nickname: string | null | undefined;
        readonly occupied: boolean;
        readonly role: string | null | undefined;
        readonly uid: string | null | undefined;
        readonly weapon: string | null | undefined;
      }>;
      readonly startsAt: string;
      readonly status: string;
      readonly title: string;
      readonly type: GroupingType;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateGroupingMutation = {
  response: documentsUpdateGroupingMutation$data;
  variables: documentsUpdateGroupingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startsAt",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupiedCount",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxSlots",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "Seat",
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
      "name": "nickname",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "weapon",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "role",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "uid",
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsUpdateGroupingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GroupingPayload",
        "kind": "LinkedField",
        "name": "updateGrouping",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Grouping",
            "kind": "LinkedField",
            "name": "grouping",
            "plural": false,
            "selections": [
              (v4/*:: as any*/),
              (v5/*:: as any*/),
              (v6/*:: as any*/),
              (v7/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Dungeon",
                "kind": "LinkedField",
                "name": "dungeon",
                "plural": false,
                "selections": [
                  (v8/*:: as any*/)
                ],
                "storageKey": null
              },
              (v9/*:: as any*/),
              (v10/*:: as any*/),
              (v11/*:: as any*/),
              (v12/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsUpdateGroupingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GroupingPayload",
        "kind": "LinkedField",
        "name": "updateGrouping",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Grouping",
            "kind": "LinkedField",
            "name": "grouping",
            "plural": false,
            "selections": [
              (v4/*:: as any*/),
              (v5/*:: as any*/),
              (v6/*:: as any*/),
              (v7/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Dungeon",
                "kind": "LinkedField",
                "name": "dungeon",
                "plural": false,
                "selections": [
                  (v8/*:: as any*/),
                  (v4/*:: as any*/)
                ],
                "storageKey": null
              },
              (v9/*:: as any*/),
              (v10/*:: as any*/),
              (v11/*:: as any*/),
              (v12/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8f7b98435985dffc341875df76b82926",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGroupingMutation(\n  $id: ID!\n  $input: UpdateGroupingInput!\n) {\n  updateGrouping(id: $id, input: $input) {\n    ok\n    error\n    grouping {\n      id\n      title\n      type\n      startsAt\n      dungeon {\n        name\n        id\n      }\n      occupiedCount\n      maxSlots\n      status\n      seats {\n        index\n        nickname\n        weapon\n        role\n        uid\n        occupied\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6e51a7f603cb6f8221714e5a41384f30";

export default node;
