/**
 * @generated SignedSource<<c40257081a845ccc8a5030a4023360d5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearPlanInput = {
  baseValues?: ReadonlyArray<GearBaseValueInput> | null | undefined;
  bowKind?: string | null | undefined;
  extraAcc?: number | null | undefined;
  extraCrit?: number | null | undefined;
  extraInt?: number | null | undefined;
  gradDingyinOn?: boolean | null | undefined;
  lib: ReadonlyArray<GearItemInput>;
  loadout?: ReadonlyArray<GearLoadoutEntryInput> | null | undefined;
  res?: number | null | undefined;
  sim?: ReadonlyArray<GearSimInput> | null | undefined;
  targetIdx: number;
  xinfa?: ReadonlyArray<string> | null | undefined;
};
export type GearBaseValueInput = {
  key: string;
  val?: number | null | undefined;
};
export type GearSimInput = {
  id: number;
  tier: string;
};
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
export type GearLoadoutEntryInput = {
  gearId: number;
  slot: string;
};
export type GearBenchPlanMutation$variables = {
  input: GearPlanInput;
};
export type GearBenchPlanMutation$data = {
  readonly gearPlan: {
    readonly baseNotes: ReadonlyArray<string>;
    readonly extraClasses: ReadonlyArray<{
      readonly cls: string;
      readonly count: number;
      readonly label: string;
    }>;
    readonly gearEvals: ReadonlyArray<{
      readonly hits: number;
      readonly id: number;
      readonly quality: number;
      readonly score: number;
      readonly verdict: string;
    }>;
    readonly grad: {
      readonly a: number;
      readonly b: number;
      readonly d: number;
      readonly dingyinRows: ReadonlyArray<{
        readonly correct: boolean;
        readonly has: boolean;
        readonly max: number | null | undefined;
        readonly name: string;
        readonly score: number;
        readonly slot: string;
        readonly val: number | null | undefined;
      }>;
      readonly got: number;
      readonly lowLines: ReadonlyArray<{
        readonly gearId: number;
        readonly key: string;
        readonly score: number;
        readonly val: number;
      }>;
      readonly rows: ReadonlyArray<{
        readonly cls: string;
        readonly cur: number;
        readonly flex: boolean;
        readonly label: string;
        readonly n: number;
      }>;
      readonly total: number;
      readonly totalBars: number;
    };
    readonly loanGrad: {
      readonly total: number;
    };
    readonly panel: {
      readonly classCounts: ReadonlyArray<{
        readonly key: string;
        readonly val: number;
      }>;
      readonly dashu: number;
      readonly dawai: number;
      readonly def: number;
      readonly finalCrit: number;
      readonly hp: number;
      readonly invalidLines: ReadonlyArray<{
        readonly gearId: number;
        readonly key: string;
        readonly val: number;
      }>;
      readonly sums: ReadonlyArray<{
        readonly key: string;
        readonly val: number;
      }>;
      readonly whiteAcc: number;
      readonly whiteCrit: number;
      readonly whiteInt: number;
      readonly xiaoshu: number;
      readonly xiaowai: number;
      readonly yAcc: number;
      readonly yCrit: number;
      readonly yInt: number;
    };
    readonly realGrad: {
      readonly total: number;
    };
    readonly suggestions: {
      readonly cur: number;
      readonly final: number;
      readonly list: ReadonlyArray<{
        readonly fromCls: string | null | undefined;
        readonly gain: number;
        readonly gearId: number | null | undefined;
        readonly kind: string;
        readonly lineIdx: number | null | undefined;
        readonly name: string | null | undefined;
        readonly slot: string;
        readonly toCls: string | null | undefined;
        readonly toKey: string | null | undefined;
      }>;
    };
    readonly xinfaDuplicates: ReadonlyArray<string>;
    readonly xinfaPicked: ReadonlyArray<string>;
  };
};
export type GearBenchPlanMutation = {
  response: GearBenchPlanMutation$data;
  variables: GearBenchPlanMutation$variables;
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
  "name": "key",
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
  (v1/*:: as any*/),
  (v2/*:: as any*/)
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "gearId",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cls",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cur",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "score",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slot",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v12 = [
  (v5/*:: as any*/)
],
v13 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "GearPlanResult",
    "kind": "LinkedField",
    "name": "gearPlan",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "GearPanel",
        "kind": "LinkedField",
        "name": "panel",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "whiteAcc",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "whiteCrit",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "whiteInt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "yAcc",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "yCrit",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "yInt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "finalCrit",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dawai",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "xiaowai",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dashu",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "xiaoshu",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hp",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "def",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearKV",
            "kind": "LinkedField",
            "name": "sums",
            "plural": true,
            "selections": (v3/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearKV",
            "kind": "LinkedField",
            "name": "classCounts",
            "plural": true,
            "selections": (v3/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearInvalidLine",
            "kind": "LinkedField",
            "name": "invalidLines",
            "plural": true,
            "selections": [
              (v4/*:: as any*/),
              (v1/*:: as any*/),
              (v2/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearGrad",
        "kind": "LinkedField",
        "name": "grad",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "a",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "b",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "d",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "got",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totalBars",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearGradRow",
            "kind": "LinkedField",
            "name": "rows",
            "plural": true,
            "selections": [
              (v6/*:: as any*/),
              (v7/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "n",
                "storageKey": null
              },
              (v8/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "flex",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearLowLine",
            "kind": "LinkedField",
            "name": "lowLines",
            "plural": true,
            "selections": [
              (v4/*:: as any*/),
              (v1/*:: as any*/),
              (v2/*:: as any*/),
              (v9/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearDingyinScoreRow",
            "kind": "LinkedField",
            "name": "dingyinRows",
            "plural": true,
            "selections": [
              (v10/*:: as any*/),
              (v11/*:: as any*/),
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "max",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "correct",
                "storageKey": null
              },
              (v9/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "has",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearGrad",
        "kind": "LinkedField",
        "name": "realGrad",
        "plural": false,
        "selections": (v12/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearGrad",
        "kind": "LinkedField",
        "name": "loanGrad",
        "plural": false,
        "selections": (v12/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearSuggestions",
        "kind": "LinkedField",
        "name": "suggestions",
        "plural": false,
        "selections": [
          (v8/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "final",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearSuggestion",
            "kind": "LinkedField",
            "name": "list",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "kind",
                "storageKey": null
              },
              (v10/*:: as any*/),
              (v4/*:: as any*/),
              (v11/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lineIdx",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "fromCls",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "toCls",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "toKey",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "gain",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearExtraClass",
        "kind": "LinkedField",
        "name": "extraClasses",
        "plural": true,
        "selections": [
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "count",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearEval",
        "kind": "LinkedField",
        "name": "gearEvals",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          (v9/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "quality",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hits",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "verdict",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "baseNotes",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "xinfaPicked",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "xinfaDuplicates",
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
    "name": "GearBenchPlanMutation",
    "selections": (v13/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearBenchPlanMutation",
    "selections": (v13/*:: as any*/)
  },
  "params": {
    "cacheID": "13770db247333207de69639204265d7f",
    "id": null,
    "metadata": {},
    "name": "GearBenchPlanMutation",
    "operationKind": "mutation",
    "text": "mutation GearBenchPlanMutation(\n  $input: GearPlanInput!\n) {\n  gearPlan(input: $input) {\n    panel {\n      whiteAcc\n      whiteCrit\n      whiteInt\n      yAcc\n      yCrit\n      yInt\n      finalCrit\n      dawai\n      xiaowai\n      dashu\n      xiaoshu\n      hp\n      def\n      sums {\n        key\n        val\n      }\n      classCounts {\n        key\n        val\n      }\n      invalidLines {\n        gearId\n        key\n        val\n      }\n    }\n    grad {\n      total\n      a\n      b\n      d\n      got\n      totalBars\n      rows {\n        cls\n        label\n        n\n        cur\n        flex\n      }\n      lowLines {\n        gearId\n        key\n        val\n        score\n      }\n      dingyinRows {\n        slot\n        name\n        val\n        max\n        correct\n        score\n        has\n      }\n    }\n    realGrad {\n      total\n    }\n    loanGrad {\n      total\n    }\n    suggestions {\n      cur\n      final\n      list {\n        kind\n        slot\n        gearId\n        name\n        lineIdx\n        fromCls\n        toCls\n        toKey\n        gain\n      }\n    }\n    extraClasses {\n      cls\n      label\n      count\n    }\n    gearEvals {\n      id\n      score\n      quality\n      hits\n      verdict\n    }\n    baseNotes\n    xinfaPicked\n    xinfaDuplicates\n  }\n}\n"
  }
};
})();

(node as any).hash = "d0d81481b0a879d268bffb9761b206ee";

export default node;
