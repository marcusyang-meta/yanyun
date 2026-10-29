/**
 * @generated SignedSource<<9f50a47f83bc635b69d31b874149d297>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearBuildSaveInput = {
  baseValues?: ReadonlyArray<GearBaseValueInput> | null | undefined;
  bowKind?: string | null | undefined;
  extraAcc?: number | null | undefined;
  extraCrit?: number | null | undefined;
  extraInt?: number | null | undefined;
  gradDingyinOn?: boolean | null | undefined;
  loadout?: ReadonlyArray<GearLoadoutEntryInput> | null | undefined;
  name: string;
  res?: number | null | undefined;
  targetIdx: number;
  xinfa?: ReadonlyArray<string> | null | undefined;
};
export type GearLoadoutEntryInput = {
  gearId: string;
  slot: string;
};
export type GearBaseValueInput = {
  key: string;
  val?: number | null | undefined;
};
export type GearLibrarySaveBuildMutation$variables = {
  input: GearBuildSaveInput;
};
export type GearLibrarySaveBuildMutation$data = {
  readonly saveGearBuild: {
    readonly build: {
      readonly baseValues: ReadonlyArray<{
        readonly key: string;
        readonly val: number | null | undefined;
      }>;
      readonly bowKind: string;
      readonly buildLabel: string;
      readonly extraAcc: number;
      readonly extraCrit: number;
      readonly extraInt: number;
      readonly gradDingyinOn: boolean;
      readonly id: string;
      readonly loadout: ReadonlyArray<{
        readonly gearId: string;
        readonly slot: string;
      }>;
      readonly name: string;
      readonly res: number;
      readonly school: string;
      readonly shareUrl: string | null | undefined;
      readonly snapA: number;
      readonly snapB: number;
      readonly snapD: number;
      readonly snapDawai: number;
      readonly snapLoan: number;
      readonly snapTotal: number;
      readonly snapXiaowai: number;
      readonly snapYAcc: number;
      readonly snapYCrit: number;
      readonly snapYInt: number;
      readonly targetIdx: number;
      readonly xinfa: ReadonlyArray<string>;
    } | null | undefined;
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GearLibrarySaveBuildMutation = {
  response: GearLibrarySaveBuildMutation$data;
  variables: GearLibrarySaveBuildMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "GearBuildPayload",
    "kind": "LinkedField",
    "name": "saveGearBuild",
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
        "concreteType": "GearSavedBuild",
        "kind": "LinkedField",
        "name": "build",
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
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "targetIdx",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "buildLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "school",
            "storageKey": null
          },
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
            "concreteType": "GearBaseValue",
            "kind": "LinkedField",
            "name": "baseValues",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "key",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "val",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "xinfa",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "res",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "extraAcc",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "extraCrit",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "extraInt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "bowKind",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "gradDingyinOn",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapTotal",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapA",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapB",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapD",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapLoan",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapYAcc",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapYCrit",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapYInt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapDawai",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "snapXiaowai",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "shareUrl",
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
    "name": "GearLibrarySaveBuildMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibrarySaveBuildMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "941a74f487ddef988f79258fa0a99d50",
    "id": null,
    "metadata": {},
    "name": "GearLibrarySaveBuildMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibrarySaveBuildMutation(\n  $input: GearBuildSaveInput!\n) {\n  saveGearBuild(input: $input) {\n    ok\n    error\n    build {\n      id\n      name\n      targetIdx\n      buildLabel\n      school\n      loadout {\n        slot\n        gearId\n      }\n      baseValues {\n        key\n        val\n      }\n      xinfa\n      res\n      extraAcc\n      extraCrit\n      extraInt\n      bowKind\n      gradDingyinOn\n      snapTotal\n      snapA\n      snapB\n      snapD\n      snapLoan\n      snapYAcc\n      snapYCrit\n      snapYInt\n      snapDawai\n      snapXiaowai\n      shareUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0693d7aecf3985017a7d5c8b78624546";

export default node;
