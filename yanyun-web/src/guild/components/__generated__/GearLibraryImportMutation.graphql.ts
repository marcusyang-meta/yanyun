/**
 * @generated SignedSource<<546645ff28e7386d17136ccb3fd625f7>>
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
export type GearLoadoutEntryInput = {
  gearId: number;
  slot: string;
};
export type GearLibraryImportMutation$variables = {
  items: ReadonlyArray<GearItemCreateInput>;
  loadout?: ReadonlyArray<GearLoadoutEntryInput> | null | undefined;
};
export type GearLibraryImportMutation$data = {
  readonly importGearItems: {
    readonly autoSelect: ReadonlyArray<{
      readonly gearId: number;
      readonly slot: string;
    }>;
    readonly error: string | null | undefined;
    readonly items: ReadonlyArray<{
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
    }>;
    readonly ok: boolean;
  };
};
export type GearLibraryImportMutation = {
  response: GearLibraryImportMutation$data;
  variables: GearLibraryImportMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "items"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "loadout"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slot",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "val",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "items",
        "variableName": "items"
      },
      {
        "kind": "Variable",
        "name": "loadout",
        "variableName": "loadout"
      }
    ],
    "concreteType": "GearImportResult",
    "kind": "LinkedField",
    "name": "importGearItems",
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
        "name": "items",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          (v1/*:: as any*/),
          (v2/*:: as any*/),
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
              (v3/*:: as any*/)
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
              (v2/*:: as any*/),
              (v3/*:: as any*/)
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearLoadoutEntry",
        "kind": "LinkedField",
        "name": "autoSelect",
        "plural": true,
        "selections": [
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "gearId",
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
    "name": "GearLibraryImportMutation",
    "selections": (v4/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibraryImportMutation",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "ee55a97915b6f9e0cda084696f91b146",
    "id": null,
    "metadata": {},
    "name": "GearLibraryImportMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryImportMutation(\n  $items: [GearItemCreateInput!]!\n  $loadout: [GearLoadoutEntryInput!]\n) {\n  importGearItems(items: $items, loadout: $loadout) {\n    ok\n    error\n    items {\n      id\n      slot\n      name\n      lines {\n        key\n        val\n      }\n      dingyin {\n        name\n        val\n      }\n      schools\n      warnings\n    }\n    autoSelect {\n      slot\n      gearId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "57b1996efed1d33b37c5f0b9996f1ccf";

export default node;
