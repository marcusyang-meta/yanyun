/**
 * @generated SignedSource<<c1de27cc27d167e4165879f1e649a7f4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearBenchQuery$variables = Record<PropertyKey, never>;
export type GearBenchQuery$data = {
  readonly gradPage: {
    readonly gearAffixes: ReadonlyArray<{
      readonly cy: number;
      readonly key: string;
      readonly label: string;
      readonly max: number;
    }>;
    readonly gearAutoDoneToast: string;
    readonly gearAutoFallbackToast: string;
    readonly gearAutoLabel: string;
    readonly gearBaseFields: ReadonlyArray<{
      readonly key: string;
      readonly label: string;
      readonly preset: number;
    }>;
    readonly gearBaseResetBody: string;
    readonly gearBaseResetLabel: string;
    readonly gearBaseResetTitle: string;
    readonly gearBaseTitle: string;
    readonly gearBenchIntro: string;
    readonly gearBenchTitle: string;
    readonly gearBowLabel: string;
    readonly gearBowNoneLabel: string;
    readonly gearBows: ReadonlyArray<{
      readonly kind: string;
      readonly label: string;
    }>;
    readonly gearBuilds: ReadonlyArray<{
      readonly bowKind: string;
      readonly bowLabel: string;
      readonly idx: number;
      readonly school: string;
      readonly sectName: string;
      readonly set: string;
    }>;
    readonly gearCalcFailedText: string;
    readonly gearClassLabels: ReadonlyArray<{
      readonly cls: string;
      readonly name: string;
    }>;
    readonly gearCopiedToast: string;
    readonly gearCopyFailedToast: string;
    readonly gearCopySummaryLabel: string;
    readonly gearDashuLabel: string;
    readonly gearDawaiLabel: string;
    readonly gearDefLabel: string;
    readonly gearDiffDoneText: string;
    readonly gearDiffEmptyText: string;
    readonly gearDiffExactText: string;
    readonly gearDiffExtraTitle: string;
    readonly gearDiffInvalidTemplate: string;
    readonly gearDiffLackTemplate: string;
    readonly gearDiffLowTitle: string;
    readonly gearDiffOverTemplate: string;
    readonly gearDiffTitle: string;
    readonly gearDyCorrectText: string;
    readonly gearDySummaryTitle: string;
    readonly gearDyWrongText: string;
    readonly gearEquipLabel: string;
    readonly gearExtraAccLabel: string;
    readonly gearExtraCritLabel: string;
    readonly gearExtraIntLabel: string;
    readonly gearExtrasTitle: string;
    readonly gearFinalCritLabel: string;
    readonly gearGradCountLabel: string;
    readonly gearGradDyLabel: string;
    readonly gearGradDyToggleLabel: string;
    readonly gearGradLabel: string;
    readonly gearGradValueLabel: string;
    readonly gearHpLabel: string;
    readonly gearLibEmptyText: string;
    readonly gearLoadoutTitle: string;
    readonly gearLoanLabel: string;
    readonly gearLockLabel: string;
    readonly gearModifiedTag: string;
    readonly gearOcrImportSlotTemplate: string;
    readonly gearPanelTitle: string;
    readonly gearResLabel: string;
    readonly gearSimActiveTag: string;
    readonly gearSlotEmptyText: string;
    readonly gearSlots: ReadonlyArray<string>;
    readonly gearSuggestHeadTemplate: string;
    readonly gearSuggestNoneText: string;
    readonly gearSuggestSwapTemplate: string;
    readonly gearSuggestTitle: string;
    readonly gearSuggestWashTemplate: string;
    readonly gearTargetLabel: string;
    readonly gearUnequipAllLabel: string;
    readonly gearUnlockLabel: string;
    readonly gearVerdictDud: string;
    readonly gearVerdictHeirloom: string;
    readonly gearVocabRules: {
      readonly ocrDingyinFallbacks: ReadonlyArray<{
        readonly name: string;
        readonly needle: string;
      }>;
      readonly ocrDingyinMarker: string;
      readonly ocrStripPrefixes: ReadonlyArray<string>;
      readonly weaponPositions: ReadonlyArray<string>;
      readonly weaponSlot: string;
    };
    readonly gearWhiteLabel: string;
    readonly gearXiaoshuLabel: string;
    readonly gearXiaowaiLabel: string;
    readonly gearXinfa: ReadonlyArray<{
      readonly name: string;
    }>;
    readonly gearXinfaLabelTemplate: string;
    readonly gearXinfaNoneLabel: string;
    readonly gearYAccLabel: string;
    readonly gearYCritLabel: string;
    readonly gearYIntLabel: string;
    readonly gradCancelLabel: string;
  };
};
export type GearBenchQuery = {
  response: GearBenchQuery$data;
  variables: GearBenchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v3 = [
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
        "name": "gearBenchTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearBenchIntro",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearCalcFailedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearTargetLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearBowLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearBowNoneLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearExtrasTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearResLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearExtraAccLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearExtraCritLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearExtraIntLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearBaseTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearUnlockLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearLockLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearModifiedTag",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearBaseResetLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearBaseResetTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearBaseResetBody",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradCancelLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearXinfaLabelTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearXinfaNoneLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearLibEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearEquipLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearUnequipAllLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearLoadoutTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearAutoLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearAutoDoneToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearAutoFallbackToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSlotEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrImportSlotTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPanelTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearGradLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearGradCountLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearGradValueLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearGradDyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearGradDyToggleLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearLoanLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSimActiveTag",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearVerdictHeirloom",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearVerdictDud",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearCopySummaryLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearCopiedToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearCopyFailedToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYAccLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYCritLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYIntLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFinalCritLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearWhiteLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDawaiLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearXiaowaiLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDashuLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearXiaoshuLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearHpLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDefLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffLackTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffExactText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffOverTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffExtraTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffLowTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffDoneText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDiffInvalidTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSuggestTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSuggestSwapTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSuggestWashTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSuggestNoneText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSuggestHeadTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDySummaryTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDyCorrectText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDyWrongText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSlots",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearVocabRules",
        "kind": "LinkedField",
        "name": "gearVocabRules",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "weaponSlot",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "weaponPositions",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ocrStripPrefixes",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ocrDingyinMarker",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearOcrFallback",
            "kind": "LinkedField",
            "name": "ocrDingyinFallbacks",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "needle",
                "storageKey": null
              },
              (v0/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
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
            "name": "sectName",
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
            "name": "bowLabel",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearBowRow",
        "kind": "LinkedField",
        "name": "gearBows",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "kind",
            "storageKey": null
          },
          (v1/*:: as any*/)
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
          (v2/*:: as any*/),
          (v1/*:: as any*/),
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
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearBaseField",
        "kind": "LinkedField",
        "name": "gearBaseFields",
        "plural": true,
        "selections": [
          (v2/*:: as any*/),
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "preset",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearXinfaRow",
        "kind": "LinkedField",
        "name": "gearXinfa",
        "plural": true,
        "selections": [
          (v0/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearNameCls",
        "kind": "LinkedField",
        "name": "gearClassLabels",
        "plural": true,
        "selections": [
          (v0/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cls",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "GearBenchQuery",
    "selections": (v3/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GearBenchQuery",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "6a21e99848e1bdc5c02c890e0608621f",
    "id": null,
    "metadata": {},
    "name": "GearBenchQuery",
    "operationKind": "query",
    "text": "query GearBenchQuery {\n  gradPage {\n    gearBenchTitle\n    gearBenchIntro\n    gearCalcFailedText\n    gearTargetLabel\n    gearBowLabel\n    gearBowNoneLabel\n    gearExtrasTitle\n    gearResLabel\n    gearExtraAccLabel\n    gearExtraCritLabel\n    gearExtraIntLabel\n    gearBaseTitle\n    gearUnlockLabel\n    gearLockLabel\n    gearModifiedTag\n    gearBaseResetLabel\n    gearBaseResetTitle\n    gearBaseResetBody\n    gradCancelLabel\n    gearXinfaLabelTemplate\n    gearXinfaNoneLabel\n    gearLibEmptyText\n    gearEquipLabel\n    gearUnequipAllLabel\n    gearLoadoutTitle\n    gearAutoLabel\n    gearAutoDoneToast\n    gearAutoFallbackToast\n    gearSlotEmptyText\n    gearOcrImportSlotTemplate\n    gearPanelTitle\n    gearGradLabel\n    gearGradCountLabel\n    gearGradValueLabel\n    gearGradDyLabel\n    gearGradDyToggleLabel\n    gearLoanLabel\n    gearSimActiveTag\n    gearVerdictHeirloom\n    gearVerdictDud\n    gearCopySummaryLabel\n    gearCopiedToast\n    gearCopyFailedToast\n    gearYAccLabel\n    gearYCritLabel\n    gearYIntLabel\n    gearFinalCritLabel\n    gearWhiteLabel\n    gearDawaiLabel\n    gearXiaowaiLabel\n    gearDashuLabel\n    gearXiaoshuLabel\n    gearHpLabel\n    gearDefLabel\n    gearDiffTitle\n    gearDiffLackTemplate\n    gearDiffExactText\n    gearDiffOverTemplate\n    gearDiffExtraTitle\n    gearDiffLowTitle\n    gearDiffDoneText\n    gearDiffEmptyText\n    gearDiffInvalidTemplate\n    gearSuggestTitle\n    gearSuggestSwapTemplate\n    gearSuggestWashTemplate\n    gearSuggestNoneText\n    gearSuggestHeadTemplate\n    gearDySummaryTitle\n    gearDyCorrectText\n    gearDyWrongText\n    gearSlots\n    gearVocabRules {\n      weaponSlot\n      weaponPositions\n      ocrStripPrefixes\n      ocrDingyinMarker\n      ocrDingyinFallbacks {\n        needle\n        name\n      }\n    }\n    gearBuilds {\n      idx\n      school\n      set\n      sectName\n      bowKind\n      bowLabel\n    }\n    gearBows {\n      kind\n      label\n    }\n    gearAffixes {\n      key\n      label\n      max\n      cy\n    }\n    gearBaseFields {\n      key\n      label\n      preset\n    }\n    gearXinfa {\n      name\n    }\n    gearClassLabels {\n      name\n      cls\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b239422c1ac05dd67c77772ce493622a";

export default node;
