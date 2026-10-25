/**
 * @generated SignedSource<<d3e4bf58c5230a3abd0c08ac838a4427>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGradCalcTextQuery$variables = Record<PropertyKey, never>;
export type documentsGradCalcTextQuery$data = {
  readonly gradPage: {
    readonly gradAffixLoadingText: string;
    readonly gradAffixPlaceholder: string;
    readonly gradBuildBigLabel: string;
    readonly gradBuildSmallLabel: string;
    readonly gradCancelLabel: string;
    readonly gradCloseLabel: string;
    readonly gradColAffixLabel: string;
    readonly gradColMaxLabel: string;
    readonly gradColResonanceLabel: string;
    readonly gradCompareTitle: string;
    readonly gradConfirmLabel: string;
    readonly gradDeleteSchemeLabel: string;
    readonly gradEnteringText: string;
    readonly gradItemScoreTemplate: string;
    readonly gradLoadLabel: string;
    readonly gradMaxTableTitle: string;
    readonly gradMingjinNote: string;
    readonly gradNoSchemesText: string;
    readonly gradOverMaxTemplate: string;
    readonly gradRateGapTemplate: string;
    readonly gradRateOkTemplate: string;
    readonly gradRateOverflowTemplate: string;
    readonly gradRateTitle: string;
    readonly gradRefTitle: string;
    readonly gradResonanceLabel: string;
    readonly gradRingLabel: string;
    readonly gradRowMainLabel: string;
    readonly gradRowResonanceLabel: string;
    readonly gradRowSubTemplate: string;
    readonly gradSaveSchemeLabel: string;
    readonly gradSchemeNameTemplate: string;
    readonly gradScoreCountLabel: string;
    readonly gradScoreRateLabel: string;
    readonly gradScoreValueLabel: string;
    readonly gradSlotTableTitleTemplate: string;
    readonly gradSubtitle: string;
    readonly gradTapHint: string;
    readonly gradTier1: string;
    readonly gradTier2: string;
    readonly gradTier3: string;
    readonly gradTier4: string;
    readonly gradTier5: string;
    readonly gradTier6: string;
    readonly gradTitle: string;
    readonly gradToastLoadedTemplate: string;
    readonly gradToastOldSchemeText: string;
    readonly gradToastSavedTemplate: string;
    readonly gradValuePlaceholder: string;
    readonly gradValuePlaceholderMaxTemplate: string;
  };
};
export type documentsGradCalcTextQuery = {
  response: documentsGradCalcTextQuery$data;
  variables: documentsGradCalcTextQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
        "name": "gradEnteringText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradSubtitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradMingjinNote",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradBuildBigLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradBuildSmallLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRingLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradScoreCountLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradScoreValueLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradScoreRateLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradTier1",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradTier2",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradTier3",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradTier4",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradTier5",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradTier6",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradTapHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRefTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradMaxTableTitle",
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
        "kind": "ScalarField",
        "name": "gradColResonanceLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradSlotTableTitleTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRateTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRateOkTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRateGapTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRateOverflowTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradCompareTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradSaveSchemeLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradSchemeNameTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradNoSchemesText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradLoadLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradDeleteSchemeLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradCloseLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradItemScoreTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRowMainLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRowSubTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradRowResonanceLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradAffixPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradAffixLoadingText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradValuePlaceholderMaxTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradValuePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradResonanceLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradOverMaxTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradToastSavedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradToastLoadedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradToastOldSchemeText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradConfirmLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gradCancelLabel",
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
    "name": "documentsGradCalcTextQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsGradCalcTextQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "64857d9c6f7907104b911872b0b2026a",
    "id": null,
    "metadata": {},
    "name": "documentsGradCalcTextQuery",
    "operationKind": "query",
    "text": "query documentsGradCalcTextQuery {\n  gradPage {\n    gradEnteringText\n    gradTitle\n    gradSubtitle\n    gradMingjinNote\n    gradBuildBigLabel\n    gradBuildSmallLabel\n    gradRingLabel\n    gradScoreCountLabel\n    gradScoreValueLabel\n    gradScoreRateLabel\n    gradTier1\n    gradTier2\n    gradTier3\n    gradTier4\n    gradTier5\n    gradTier6\n    gradTapHint\n    gradRefTitle\n    gradMaxTableTitle\n    gradColAffixLabel\n    gradColMaxLabel\n    gradColResonanceLabel\n    gradSlotTableTitleTemplate\n    gradRateTitle\n    gradRateOkTemplate\n    gradRateGapTemplate\n    gradRateOverflowTemplate\n    gradCompareTitle\n    gradSaveSchemeLabel\n    gradSchemeNameTemplate\n    gradNoSchemesText\n    gradLoadLabel\n    gradDeleteSchemeLabel\n    gradCloseLabel\n    gradItemScoreTemplate\n    gradRowMainLabel\n    gradRowSubTemplate\n    gradRowResonanceLabel\n    gradAffixPlaceholder\n    gradAffixLoadingText\n    gradValuePlaceholderMaxTemplate\n    gradValuePlaceholder\n    gradResonanceLabel\n    gradOverMaxTemplate\n    gradToastSavedTemplate\n    gradToastLoadedTemplate\n    gradToastOldSchemeText\n    gradConfirmLabel\n    gradCancelLabel\n  }\n}\n"
  }
};
})();

(node as any).hash = "f97968a6ba027bdcb2d131d4bf705b91";

export default node;
