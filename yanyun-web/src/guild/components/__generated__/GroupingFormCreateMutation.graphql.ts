/**
 * @generated SignedSource<<73bedb4864e7f800d6135cb717eaa1e3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CustomFieldType = "CHOICE" | "TEXT" | "%future added value";
export type GroupingType = "ACTIVITY" | "EXPLORE" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type CreateGroupingInput = {
  customFields?: ReadonlyArray<CustomFieldInput> | null | undefined;
  dungeonId?: string | null | undefined;
  maxSlots?: number | null | undefined;
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
export type CustomFieldInput = {
  fieldType: CustomFieldType;
  label: string;
  options?: ReadonlyArray<string> | null | undefined;
  required?: boolean | null | undefined;
};
export type GroupingFormCreateMutation$variables = {
  input: CreateGroupingInput;
};
export type GroupingFormCreateMutation$data = {
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
export type GroupingFormCreateMutation = {
  response: GroupingFormCreateMutation$data;
  variables: GroupingFormCreateMutation$variables;
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
    "name": "GroupingFormCreateMutation",
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
    "name": "GroupingFormCreateMutation",
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
    "cacheID": "0bc4e9d53a094968d7b40833b681429e",
    "id": null,
    "metadata": {},
    "name": "GroupingFormCreateMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingFormCreateMutation(\n  $input: CreateGroupingInput!\n) {\n  createGrouping(input: $input) {\n    ok\n    error\n    grouping {\n      id\n      title\n      type\n      startsAt\n      dungeon {\n        name\n        id\n      }\n      occupiedCount\n      maxSlots\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "695f6d62f38c3b868776927e6920f0a4";

export default node;
