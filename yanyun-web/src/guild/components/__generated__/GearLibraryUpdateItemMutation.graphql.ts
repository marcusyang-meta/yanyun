/**
 * @generated SignedSource<<7d267aea8207068e01b1c2ba99f4ed5d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearItemCreateInput = {
  dingyin?: GearDingyinInput | null | undefined;
  lines: ReadonlyArray<GearLineInput>;
  name?: string | null | undefined;
  schools?: ReadonlyArray<string> | null | undefined;
  slot: string;
};
export type GearLineInput = {
  key: string;
  val: number;
};
export type GearDingyinInput = {
  name: string;
  val: number;
};
export type GearLibraryUpdateItemMutation$variables = {
  id: number;
  input: GearItemCreateInput;
};
export type GearLibraryUpdateItemMutation$data = {
  readonly updateGearItem: {
    readonly error: string | null | undefined;
    readonly item: {
      readonly dingyin: {
        readonly name: string;
        readonly val: number;
      } | null | undefined;
      readonly id: number;
      readonly lines: ReadonlyArray<{
        readonly key: string;
        readonly val: number;
      }>;
      readonly name: string;
      readonly schools: ReadonlyArray<string>;
      readonly slot: string;
      readonly warnings: ReadonlyArray<string>;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type GearLibraryUpdateItemMutation = {
  response: GearLibraryUpdateItemMutation$data;
  variables: GearLibraryUpdateItemMutation$variables;
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "val",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
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
    "concreteType": "GearItemPayload",
    "kind": "LinkedField",
    "name": "updateGearItem",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearItem",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
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
            "name": "slot",
            "storageKey": null
          },
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "GearLine",
            "kind": "LinkedField",
            "name": "lines",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "key",
                "storageKey": null
              },
              (v2/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearDingyin",
            "kind": "LinkedField",
            "name": "dingyin",
            "plural": false,
            "selections": [
              (v1/*:: as any*/),
              (v2/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "schools",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "warnings",
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
    "name": "GearLibraryUpdateItemMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibraryUpdateItemMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "00b0467fb64ac36f89ca63d9b77abdda",
    "id": null,
    "metadata": {},
    "name": "GearLibraryUpdateItemMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryUpdateItemMutation(\n  $id: Int!\n  $input: GearItemCreateInput!\n) {\n  updateGearItem(id: $id, input: $input) {\n    ok\n    error\n    item {\n      id\n      slot\n      name\n      lines {\n        key\n        val\n      }\n      dingyin {\n        name\n        val\n      }\n      schools\n      warnings\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0047cc72103fbd12e3a00f7c85f3d1d3";

export default node;
