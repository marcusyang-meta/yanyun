/**
 * @generated SignedSource<<1d38f741c3048d36a325bce543181d2d>>
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
export type GearLibraryAddItemMutation$variables = {
  input: GearItemCreateInput;
};
export type GearLibraryAddItemMutation$data = {
  readonly addGearItem: {
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
export type GearLibraryAddItemMutation = {
  response: GearLibraryAddItemMutation$data;
  variables: GearLibraryAddItemMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "GearItemPayload",
    "kind": "LinkedField",
    "name": "addGearItem",
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
    "name": "GearLibraryAddItemMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibraryAddItemMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "f77e4c0232cd7af36202ab11136d66e3",
    "id": null,
    "metadata": {},
    "name": "GearLibraryAddItemMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryAddItemMutation(\n  $input: GearItemCreateInput!\n) {\n  addGearItem(input: $input) {\n    ok\n    error\n    item {\n      id\n      slot\n      name\n      lines {\n        key\n        val\n      }\n      dingyin {\n        name\n        val\n      }\n      schools\n      warnings\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b1cfe435d73be66e8e1bc7949aad0836";

export default node;
