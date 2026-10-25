/**
 * @generated SignedSource<<58572020e3299041b5421cfc69ce732a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "%future added value";
export type CreateGroupingInput = {
  dungeonId?: string | null | undefined;
  seats?: ReadonlyArray<SeatInput> | null | undefined;
  slug: string;
  startsAt: string;
  title: string;
  type: GroupingType;
};
export type SeatInput = {
  nickname: string;
  weapon: string;
};
export type documentsCreateGroupingMutation$variables = {
  input: CreateGroupingInput;
};
export type documentsCreateGroupingMutation$data = {
  readonly createGrouping: {
    readonly error: string | null | undefined;
    readonly grouping: {
      readonly dungeon: {
        readonly name: string;
      } | null | undefined;
      readonly id: string;
      readonly maxSlots: number;
      readonly occupiedCount: number;
      readonly startsAt: string;
      readonly status: string;
      readonly title: string;
      readonly type: GroupingType;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsCreateGroupingMutation = {
  response: documentsCreateGroupingMutation$data;
  variables: documentsCreateGroupingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsCreateGroupingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GroupingPayload",
        "kind": "LinkedField",
        "name": "createGrouping",
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
              (v11/*:: as any*/)
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
    "name": "documentsCreateGroupingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GroupingPayload",
        "kind": "LinkedField",
        "name": "createGrouping",
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
              (v11/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "fdf897496169f6fe960c12fba832a8d7",
    "id": null,
    "metadata": {},
    "name": "documentsCreateGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCreateGroupingMutation(\n  $input: CreateGroupingInput!\n) {\n  createGrouping(input: $input) {\n    ok\n    error\n    grouping {\n      id\n      title\n      type\n      startsAt\n      dungeon {\n        name\n        id\n      }\n      occupiedCount\n      maxSlots\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f2a57d96ce9aa1b3a36e76adba79c0d5";

export default node;
