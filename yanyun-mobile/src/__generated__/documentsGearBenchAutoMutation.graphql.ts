/**
 * @generated SignedSource<<51425789208d2c9e7d0f7a9c86674b13>>
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
export type documentsGearBenchAutoMutation$variables = {
  lib: ReadonlyArray<GearItemInput>;
  targetIdx: number;
};
export type documentsGearBenchAutoMutation$data = {
  readonly gearAutoCombine: {
    readonly fallbackUsed: boolean;
    readonly loadout: ReadonlyArray<{
      readonly gearId: number;
      readonly slot: string;
    }>;
  };
};
export type documentsGearBenchAutoMutation = {
  response: documentsGearBenchAutoMutation$data;
  variables: documentsGearBenchAutoMutation$variables;
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
    "name": "documentsGearBenchAutoMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGearBenchAutoMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "2ae358ce087abd23bbae6aa28b74194f",
    "id": null,
    "metadata": {},
    "name": "documentsGearBenchAutoMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearBenchAutoMutation(\n  $lib: [GearItemInput!]!\n  $targetIdx: Int!\n) {\n  gearAutoCombine(lib: $lib, targetIdx: $targetIdx) {\n    loadout {\n      slot\n      gearId\n    }\n    fallbackUsed\n  }\n}\n"
  }
};
})();

(node as any).hash = "818aeb4b9b4717f7c8c5b7432fd8a11a";

export default node;
