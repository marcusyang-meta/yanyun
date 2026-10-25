/**
 * @generated SignedSource<<e2b419acfc3740340a25f1d7f2921fee>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearQuickInput = {
  res?: number | null | undefined;
  whiteAcc: number;
  whiteCrit: number;
  whiteInt: number;
};
export type documentsGearQuickCalcMutation$variables = {
  input: GearQuickInput;
};
export type documentsGearQuickCalcMutation$data = {
  readonly gearQuickCalc: {
    readonly acc: {
      readonly bars: number;
      readonly capped: boolean;
      readonly lack: number;
      readonly needWhite: number;
      readonly over: number;
      readonly yellow: number;
    };
    readonly crit: {
      readonly bars: number;
      readonly capped: boolean;
      readonly lack: number;
      readonly needWhite: number;
      readonly over: number;
      readonly yellow: number;
    };
    readonly int: {
      readonly bars: number;
      readonly capped: boolean;
      readonly lack: number;
      readonly needWhite: number;
      readonly over: number;
      readonly yellow: number;
    };
  };
};
export type documentsGearQuickCalcMutation = {
  response: documentsGearQuickCalcMutation$data;
  variables: documentsGearQuickCalcMutation$variables;
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
    "args": null,
    "kind": "ScalarField",
    "name": "yellow",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "capped",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "over",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "lack",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "needWhite",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "bars",
    "storageKey": null
  }
],
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "GearQuickResult",
    "kind": "LinkedField",
    "name": "gearQuickCalc",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "GearRateStatus",
        "kind": "LinkedField",
        "name": "acc",
        "plural": false,
        "selections": (v1/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearRateStatus",
        "kind": "LinkedField",
        "name": "crit",
        "plural": false,
        "selections": (v1/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearRateStatus",
        "kind": "LinkedField",
        "name": "int",
        "plural": false,
        "selections": (v1/*:: as any*/),
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
    "name": "documentsGearQuickCalcMutation",
    "selections": (v2/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGearQuickCalcMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "40704c757d1ff659c5f62a8ae275f622",
    "id": null,
    "metadata": {},
    "name": "documentsGearQuickCalcMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearQuickCalcMutation(\n  $input: GearQuickInput!\n) {\n  gearQuickCalc(input: $input) {\n    acc {\n      yellow\n      capped\n      over\n      lack\n      needWhite\n      bars\n    }\n    crit {\n      yellow\n      capped\n      over\n      lack\n      needWhite\n      bars\n    }\n    int {\n      yellow\n      capped\n      over\n      lack\n      needWhite\n      bars\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ff2df5ab5f664bded57367937bab6f3b";

export default node;
