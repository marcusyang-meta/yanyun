/**
 * @generated SignedSource<<8f70a65de6337ce8c50b2946b64c4f34>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearRefsQuery$variables = Record<PropertyKey, never>;
export type GearRefsQuery$data = {
  readonly gradPage: {
    readonly gearAffixTableTitle: string;
    readonly gearAffixes: ReadonlyArray<{
      readonly cy: number;
      readonly cyPct: number;
      readonly key: string;
      readonly label: string;
      readonly max: number;
      readonly recipeNames: ReadonlyArray<string>;
    }>;
    readonly gearBuilds: ReadonlyArray<{
      readonly bowLabel: string;
      readonly cat: string;
      readonly idx: number;
      readonly recipe: string;
      readonly school: string;
      readonly sectName: string;
      readonly set: string;
      readonly targets: ReadonlyArray<{
        readonly label: string;
        readonly n: number;
      }>;
    }>;
    readonly gearColConvLabel: string;
    readonly gearColCyLabel: string;
    readonly gearColCyPctLabel: string;
    readonly gearColDimLabel: string;
    readonly gearColRecipeNamesLabel: string;
    readonly gearDimRows: ReadonlyArray<{
      readonly conv: string;
      readonly full: string;
      readonly name: string;
    }>;
    readonly gearFormSlotLabel: string;
    readonly gearFormulaAccTemplate: string;
    readonly gearFormulaBarsTemplate: string;
    readonly gearFormulaBowTemplate: string;
    readonly gearFormulaCritTemplate: string;
    readonly gearFormulaDimsTitle: string;
    readonly gearFormulaIntTemplate: string;
    readonly gearFormulaOrderText: string;
    readonly gearFormulaOrderTitle: string;
    readonly gearFormulaRatesTitle: string;
    readonly gearFormulaTitle: string;
    readonly gearRecipeAllLabel: string;
    readonly gearRecipeColBow: string;
    readonly gearRecipeColCat: string;
    readonly gearRecipeColRecipe: string;
    readonly gearRecipeColSchool: string;
    readonly gearRecipeColSet: string;
    readonly gearRecipeEmptyText: string;
    readonly gearRecipeSearchPlaceholder: string;
    readonly gearRecipeSetTargetLabel: string;
    readonly gearRecipeTargetToastTemplate: string;
    readonly gearRecipesTitle: string;
    readonly gearResDefault: number;
    readonly gearSlotTableTitle: string;
    readonly gearSlotsBig: ReadonlyArray<{
      readonly lines: ReadonlyArray<string>;
      readonly slot: string;
    }>;
    readonly gearSlotsBigTitle: string;
    readonly gearSlotsSmall: ReadonlyArray<{
      readonly lines: ReadonlyArray<string>;
      readonly slot: string;
    }>;
    readonly gearSlotsSmallTitle: string;
    readonly gearSurvivalNote: string;
    readonly gradColAffixLabel: string;
    readonly gradColMaxLabel: string;
  };
};
export type GearRefsQuery = {
  response: GearRefsQuery$data;
  variables: GearRefsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v1 = [
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
    "name": "lines",
    "storageKey": null
  }
],
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "GradPage",
    "kind": "LinkedField",
    "name": "gradPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipesTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeSearchPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeAllLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeColCat",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeColSchool",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeColSet",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeColRecipe",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeColBow",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeSetTargetLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeTargetToastTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearAffixTableTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearColCyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearColCyPctLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearColRecipeNamesLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSurvivalNote",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSlotTableTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSlotsBigTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSlotsSmallTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaRatesTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaDimsTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaOrderTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaAccTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaCritTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaIntTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaBarsTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaBowTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormulaOrderText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearColDimLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearColConvLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormSlotLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradColAffixLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradColMaxLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearBuild",
        "kind": "LinkedField",
        "name": "gearBuilds",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "idx",
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
            "kind": "ScalarField",
            "name": "set",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cat",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "sectName",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "bowLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "recipe",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearTarget",
            "kind": "LinkedField",
            "name": "targets",
            "plural": true,
            "selections": [
              (v0/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "n",
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
        "concreteType": "GearAffixRow",
        "kind": "LinkedField",
        "name": "gearAffixes",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "key",
            "storageKey": null
          },
          (v0/*:: as any*/),
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
            "name": "cy",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cyPct",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "recipeNames",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearSlotRow",
        "kind": "LinkedField",
        "name": "gearSlotsBig",
        "plural": true,
        "selections": (v1/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearSlotRow",
        "kind": "LinkedField",
        "name": "gearSlotsSmall",
        "plural": true,
        "selections": (v1/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearDimRow",
        "kind": "LinkedField",
        "name": "gearDimRows",
        "plural": true,
        "selections": [
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
            "name": "conv",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "full",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearResDefault",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "GearRefsQuery",
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GearRefsQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "82c9d4cf4a86b77ec1907699301a1dd8",
    "id": null,
    "metadata": {},
    "name": "GearRefsQuery",
    "operationKind": "query",
    "text": "query GearRefsQuery {\n  gradPage {\n    gearRecipesTitle\n    gearRecipeSearchPlaceholder\n    gearRecipeAllLabel\n    gearRecipeColCat\n    gearRecipeColSchool\n    gearRecipeColSet\n    gearRecipeColRecipe\n    gearRecipeColBow\n    gearRecipeSetTargetLabel\n    gearRecipeEmptyText\n    gearRecipeTargetToastTemplate\n    gearAffixTableTitle\n    gearColCyLabel\n    gearColCyPctLabel\n    gearColRecipeNamesLabel\n    gearSurvivalNote\n    gearSlotTableTitle\n    gearSlotsBigTitle\n    gearSlotsSmallTitle\n    gearFormulaTitle\n    gearFormulaRatesTitle\n    gearFormulaDimsTitle\n    gearFormulaOrderTitle\n    gearFormulaAccTemplate\n    gearFormulaCritTemplate\n    gearFormulaIntTemplate\n    gearFormulaBarsTemplate\n    gearFormulaBowTemplate\n    gearFormulaOrderText\n    gearColDimLabel\n    gearColConvLabel\n    gearFormSlotLabel\n    gradColAffixLabel\n    gradColMaxLabel\n    gearBuilds {\n      idx\n      school\n      set\n      cat\n      sectName\n      bowLabel\n      recipe\n      targets {\n        label\n        n\n      }\n    }\n    gearAffixes {\n      key\n      label\n      max\n      cy\n      cyPct\n      recipeNames\n    }\n    gearSlotsBig {\n      slot\n      lines\n    }\n    gearSlotsSmall {\n      slot\n      lines\n    }\n    gearDimRows {\n      name\n      conv\n      full\n    }\n    gearResDefault\n  }\n}\n"
  }
};
})();

(node as any).hash = "e8eab92b806a8e90c87025fb57c4b2bd";

export default node;
