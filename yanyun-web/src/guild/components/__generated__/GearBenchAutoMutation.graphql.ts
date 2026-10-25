/**
 * @generated SignedSource<<dde18ce5428f38edb6e1e9b766ee0205>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearItemInput = {
  dingyin?: GearDingyinInput | null | undefined;
  id: number;
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
export type GearBenchAutoMutation$variables = {
  lib: ReadonlyArray<GearItemInput>;
  targetIdx: number;
};
export type GearBenchAutoMutation$data = {
  readonly gearAutoCombine: {
    readonly fallbackUsed: boolean;
    readonly loadout: ReadonlyArray<{
      readonly gearId: number;
      readonly slot: string;
    }>;
  };
};
export type GearBenchAutoMutation = {
  response: GearBenchAutoMutation$data;
  variables: GearBenchAutoMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "lib"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "targetIdx"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "lib",
        "variableName": "lib"
      },
      {
        "kind": "Variable",
        "name": "targetIdx",
        "variableName": "targetIdx"
      }
    ],
    "concreteType": "GearAutoResult",
    "kind": "LinkedField",
    "name": "gearAutoCombine",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "GearLoadoutEntry",
        "kind": "LinkedField",
        "name": "loadout",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slot",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "gearId",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "fallbackUsed",
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
    "name": "GearBenchAutoMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearBenchAutoMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "9e96c0c43ac2f6c95d2ce30b758e47d0",
    "id": null,
    "metadata": {},
    "name": "GearBenchAutoMutation",
    "operationKind": "mutation",
    "text": "mutation GearBenchAutoMutation(\n  $lib: [GearItemInput!]!\n  $targetIdx: Int!\n) {\n  gearAutoCombine(lib: $lib, targetIdx: $targetIdx) {\n    loadout {\n      slot\n      gearId\n    }\n    fallbackUsed\n  }\n}\n"
  }
};
})();

(node as any).hash = "c427cb5484cea94bdab83ff2b6023ea4";

export default node;
