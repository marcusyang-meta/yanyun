/**
 * @generated SignedSource<<638c5a01d0f84c7f9370b68eebc8f438>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryQuery$variables = Record<PropertyKey, never>;
export type documentsGearLibraryQuery$data = {
  readonly gradPage: {
    readonly gearAddGearLabel: string;
    readonly gearAddRowLabel: string;
    readonly gearAffixPlaceholder: string;
    readonly gearAffixes: ReadonlyArray<{
      readonly cy: number;
      readonly key: string;
      readonly label: string;
      readonly max: number;
    }>;
    readonly gearBaseFields: ReadonlyArray<{
      readonly key: string;
      readonly preset: number;
    }>;
    readonly gearBuilds: ReadonlyArray<{
      readonly bowKind: string;
      readonly idx: number;
      readonly school: string;
    }>;
    readonly gearCalcFailedText: string;
    readonly gearCancelEditLabel: string;
    readonly gearClearConfirmBody: string;
    readonly gearClearConfirmTitle: string;
    readonly gearClearLibLabel: string;
    readonly gearClearedToast: string;
    readonly gearCopiedToast: string;
    readonly gearCopyFailedToast: string;
    readonly gearCopyLinkLabel: string;
    readonly gearDelRowLabel: string;
    readonly gearDeleteLabel: string;
    readonly gearDeletedToast: string;
    readonly gearDemoKit: ReadonlyArray<{
      readonly dingyinName: string;
      readonly dingyinVal: number;
      readonly keys: ReadonlyArray<string>;
      readonly name: string;
      readonly slot: string;
    }>;
    readonly gearDemoLabel: string;
    readonly gearDemoLoadedToast: string;
    readonly gearDingyinLeft: ReadonlyArray<{
      readonly max: number;
      readonly name: string;
    }>;
    readonly gearDingyinRightMax: number;
    readonly gearDyNameLabel: string;
    readonly gearDyValLabel: string;
    readonly gearEditLabel: string;
    readonly gearEquipLabel: string;
    readonly gearEquippedTag: string;
    readonly gearExportLabel: string;
    readonly gearFillCyLabel: string;
    readonly gearFillMaxLabel: string;
    readonly gearFormNameLabel: string;
    readonly gearFormNamePlaceholder: string;
    readonly gearFormSlotLabel: string;
    readonly gearGearSlots: ReadonlyArray<string>;
    readonly gearGradLabel: string;
    readonly gearImportFailedToast: string;
    readonly gearImportLabel: string;
    readonly gearImportedToastTemplate: string;
    readonly gearLibCountTemplate: string;
    readonly gearLibEmptyText: string;
    readonly gearLibTitle: string;
    readonly gearLoginHint: string;
    readonly gearManualTitle: string;
    readonly gearMyBuildsTitle: string;
    readonly gearMyLibTitle: string;
    readonly gearNameToClass: ReadonlyArray<{
      readonly cls: string;
      readonly name: string;
    }>;
    readonly gearOcrAddRowLabel: string;
    readonly gearOcrAliases: ReadonlyArray<{
      readonly key: string;
      readonly name: string;
    }>;
    readonly gearOcrBadTypeText: string;
    readonly gearOcrBatchAdjustLabel: string;
    readonly gearOcrBatchApplyBoxLabel: string;
    readonly gearOcrBatchDetectedText: string;
    readonly gearOcrBatchDropText: string;
    readonly gearOcrBatchDupLibText: string;
    readonly gearOcrBatchDupRowText: string;
    readonly gearOcrBatchDupTag: string;
    readonly gearOcrBatchFailedText: string;
    readonly gearOcrBatchFullImageText: string;
    readonly gearOcrBatchImportTemplate: string;
    readonly gearOcrBatchImportedText: string;
    readonly gearOcrBatchIncludeLabel: string;
    readonly gearOcrBatchNoLinesText: string;
    readonly gearOcrBatchQueuedText: string;
    readonly gearOcrBatchReadyText: string;
    readonly gearOcrBatchRemoveLabel: string;
    readonly gearOcrBatchResultTemplate: string;
    readonly gearOcrBatchRetryLabel: string;
    readonly gearOcrBatchRunningText: string;
    readonly gearOcrBatchTitle: string;
    readonly gearOcrCancelLabel: string;
    readonly gearOcrConfirmLabel: string;
    readonly gearOcrDoneTemplate: string;
    readonly gearOcrDropText: string;
    readonly gearOcrEquipLabel: string;
    readonly gearOcrFailedText: string;
    readonly gearOcrLowConfTag: string;
    readonly gearOcrNameLabel: string;
    readonly gearOcrNeedLineToast: string;
    readonly gearOcrNoEngineText: string;
    readonly gearOcrPreparingText: string;
    readonly gearOcrRunningText: string;
    readonly gearOcrSavedTemplate: string;
    readonly gearOcrSecondText: string;
    readonly gearOcrSlotLabel: string;
    readonly gearOcrTitle: string;
    readonly gearOcrTooBigText: string;
    readonly gearOcrUnknownTitle: string;
    readonly gearPasteButtonLabel: string;
    readonly gearPasteDemoLabel: string;
    readonly gearPasteEmptyText: string;
    readonly gearPasteFailText: string;
    readonly gearPasteFullText: string;
    readonly gearPasteNames: ReadonlyArray<{
      readonly key: string;
      readonly name: string;
    }>;
    readonly gearPasteOkTemplate: string;
    readonly gearPastePlaceholder: string;
    readonly gearPasteTitle: string;
    readonly gearPasteUnknownTemplate: string;
    readonly gearQualityLabel: string;
    readonly gearRecipeAllLabel: string;
    readonly gearRefTemplate: string;
    readonly gearRevokeShareLabel: string;
    readonly gearSavedToastTemplate: string;
    readonly gearSchemeComposeFirstText: string;
    readonly gearSchemeDeleteLabel: string;
    readonly gearSchemeEmptyText: string;
    readonly gearSchemeGroupCountTemplate: string;
    readonly gearSchemeLoadLabel: string;
    readonly gearSchemeLoadedToastTemplate: string;
    readonly gearSchemeNameTemplate: string;
    readonly gearSchemeSaveLabel: string;
    readonly gearSchemeSavedToastTemplate: string;
    readonly gearSchemeTitle: string;
    readonly gearSchoolTags: ReadonlyArray<string>;
    readonly gearSchoolsLabel: string;
    readonly gearScoreTemplate: string;
    readonly gearShareLabel: string;
    readonly gearShareRevokedToast: string;
    readonly gearSimCyLabel: string;
    readonly gearSimLabel: string;
    readonly gearSimMaxLabel: string;
    readonly gearSimRealLabel: string;
    readonly gearSlotAliases: ReadonlyArray<{
      readonly key: string;
      readonly name: string;
    }>;
    readonly gearTargetLabel: string;
    readonly gearUnequipLabel: string;
    readonly gearUpdateGearLabel: string;
    readonly gearUsageCount: number;
    readonly gearUsageLimit: number;
    readonly gearUsageNearLimitText: string;
    readonly gearUsageTemplate: string;
    readonly gearValuePlaceholder: string;
    readonly gearVerdictDud: string;
    readonly gearVerdictHeirloom: string;
    readonly gearWuxueNames: ReadonlyArray<string>;
    readonly gearYAccLabel: string;
    readonly gearYCritLabel: string;
    readonly gearYIntLabel: string;
    readonly gradCancelLabel: string;
  };
  readonly myGearBuilds: ReadonlyArray<{
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
    readonly id: number;
    readonly loadout: ReadonlyArray<{
      readonly gearId: number;
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
  }>;
  readonly myGearItems: ReadonlyArray<{
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
  readonly viewer: {
    readonly user: {
      readonly discordId: string;
    } | null | undefined;
  };
};
export type documentsGearLibraryQuery = {
  response: documentsGearLibraryQuery$data;
  variables: documentsGearLibraryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "school",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bowKind",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slot",
  "storageKey": null
},
v6 = [
  (v4/*:: as any*/),
  (v2/*:: as any*/)
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "val",
  "storageKey": null
},
v9 = [
  (v2/*:: as any*/),
  (v8/*:: as any*/)
],
v10 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DiscordUser",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "discordId",
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
    "concreteType": "GradPage",
    "kind": "LinkedField",
    "name": "gradPage",
    "plural": false,
    "selections": [
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
        "name": "gearLibTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearMyLibTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearMyBuildsTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearLoginHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearLibCountTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearUsageCount",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearUsageLimit",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearUsageTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearUsageNearLimitText",
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
        "name": "gearFormNameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFormNamePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearAffixPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearValuePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRefTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFillMaxLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearFillCyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDelRowLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearAddRowLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDyNameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDyValLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchoolsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearAddGearLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearUpdateGearLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearCancelEditLabel",
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
        "name": "gearDemoLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearClearLibLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearClearConfirmTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearClearConfirmBody",
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
        "name": "gearUnequipLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearEditLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDeleteLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSimLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSimRealLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSimCyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSimMaxLabel",
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
        "name": "gearScoreTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQualityLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearExportLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearImportLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearImportFailedToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearImportedToastTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearManualTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPasteTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPastePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPasteButtonLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPasteDemoLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPasteEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPasteOkTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPasteUnknownTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPasteFailText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearPasteFullText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrDropText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrPreparingText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrRunningText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrSecondText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrFailedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBadTypeText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrTooBigText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrNoEngineText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrDoneTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrSlotLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrNameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrEquipLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrConfirmLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrCancelLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrUnknownTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrSavedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrNeedLineToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrLowConfTag",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrAddRowLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchDropText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchQueuedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchRunningText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchReadyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchFailedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchImportedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchRetryLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchRemoveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchAdjustLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchApplyBoxLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchDetectedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchFullImageText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchDupTag",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchDupLibText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchDupRowText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchIncludeLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchNoLinesText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchImportTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearOcrBatchResultTemplate",
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
        "name": "gearEquippedTag",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeSaveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeNameTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeLoadLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeDeleteLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeComposeFirstText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeSavedToastTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeLoadedToastTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchemeGroupCountTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearShareLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRevokeShareLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearCopyLinkLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearShareRevokedToast",
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
        "name": "gearSavedToastTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDemoLoadedToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDeletedToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearClearedToast",
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
        "name": "gearTargetLabel",
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
        "name": "gearGearSlots",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSchoolTags",
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
          (v0/*:: as any*/),
          (v1/*:: as any*/)
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
        "concreteType": "GearAffixRow",
        "kind": "LinkedField",
        "name": "gearAffixes",
        "plural": true,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "label",
            "storageKey": null
          },
          (v3/*:: as any*/),
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
        "concreteType": "GearNameMax",
        "kind": "LinkedField",
        "name": "gearDingyinLeft",
        "plural": true,
        "selections": [
          (v4/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearDingyinRightMax",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearWuxueNames",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearDemoItem",
        "kind": "LinkedField",
        "name": "gearDemoKit",
        "plural": true,
        "selections": [
          (v5/*:: as any*/),
          (v4/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "keys",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dingyinName",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dingyinVal",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearNameKey",
        "kind": "LinkedField",
        "name": "gearPasteNames",
        "plural": true,
        "selections": (v6/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearNameCls",
        "kind": "LinkedField",
        "name": "gearNameToClass",
        "plural": true,
        "selections": [
          (v4/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cls",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearNameKey",
        "kind": "LinkedField",
        "name": "gearSlotAliases",
        "plural": true,
        "selections": (v6/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearNameKey",
        "kind": "LinkedField",
        "name": "gearOcrAliases",
        "plural": true,
        "selections": (v6/*:: as any*/),
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "GearItem",
    "kind": "LinkedField",
    "name": "myGearItems",
    "plural": true,
    "selections": [
      (v7/*:: as any*/),
      (v5/*:: as any*/),
      (v4/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "GearLine",
        "kind": "LinkedField",
        "name": "lines",
        "plural": true,
        "selections": (v9/*:: as any*/),
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
          (v4/*:: as any*/),
          (v8/*:: as any*/)
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
    "concreteType": "GearSavedBuild",
    "kind": "LinkedField",
    "name": "myGearBuilds",
    "plural": true,
    "selections": [
      (v7/*:: as any*/),
      (v4/*:: as any*/),
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
      (v0/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "GearLoadoutEntry",
        "kind": "LinkedField",
        "name": "loadout",
        "plural": true,
        "selections": [
          (v5/*:: as any*/),
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
        "selections": (v9/*:: as any*/),
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
      (v1/*:: as any*/),
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGearLibraryQuery",
    "selections": (v10/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsGearLibraryQuery",
    "selections": (v10/*:: as any*/)
  },
  "params": {
    "cacheID": "a6a57730fa3e505fdeff71832f64bc57",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryQuery",
    "operationKind": "query",
    "text": "query documentsGearLibraryQuery {\n  viewer {\n    user {\n      discordId\n    }\n  }\n  gradPage {\n    gearCalcFailedText\n    gearLibTitle\n    gearMyLibTitle\n    gearMyBuildsTitle\n    gearLoginHint\n    gearLibCountTemplate\n    gearUsageCount\n    gearUsageLimit\n    gearUsageTemplate\n    gearUsageNearLimitText\n    gearFormSlotLabel\n    gearFormNameLabel\n    gearFormNamePlaceholder\n    gearAffixPlaceholder\n    gearValuePlaceholder\n    gearRefTemplate\n    gearFillMaxLabel\n    gearFillCyLabel\n    gearDelRowLabel\n    gearAddRowLabel\n    gearDyNameLabel\n    gearDyValLabel\n    gearSchoolsLabel\n    gearAddGearLabel\n    gearUpdateGearLabel\n    gearCancelEditLabel\n    gradCancelLabel\n    gearDemoLabel\n    gearClearLibLabel\n    gearClearConfirmTitle\n    gearClearConfirmBody\n    gearEquipLabel\n    gearUnequipLabel\n    gearEditLabel\n    gearDeleteLabel\n    gearSimLabel\n    gearSimRealLabel\n    gearSimCyLabel\n    gearSimMaxLabel\n    gearVerdictHeirloom\n    gearVerdictDud\n    gearScoreTemplate\n    gearQualityLabel\n    gearExportLabel\n    gearImportLabel\n    gearImportFailedToast\n    gearImportedToastTemplate\n    gearManualTitle\n    gearPasteTitle\n    gearPastePlaceholder\n    gearPasteButtonLabel\n    gearPasteDemoLabel\n    gearPasteEmptyText\n    gearPasteOkTemplate\n    gearPasteUnknownTemplate\n    gearPasteFailText\n    gearPasteFullText\n    gearOcrTitle\n    gearOcrDropText\n    gearOcrPreparingText\n    gearOcrRunningText\n    gearOcrSecondText\n    gearOcrFailedText\n    gearOcrBadTypeText\n    gearOcrTooBigText\n    gearOcrNoEngineText\n    gearOcrDoneTemplate\n    gearOcrSlotLabel\n    gearOcrNameLabel\n    gearOcrEquipLabel\n    gearOcrConfirmLabel\n    gearOcrCancelLabel\n    gearOcrUnknownTitle\n    gearOcrSavedTemplate\n    gearOcrNeedLineToast\n    gearOcrLowConfTag\n    gearOcrAddRowLabel\n    gearOcrBatchTitle\n    gearOcrBatchDropText\n    gearOcrBatchQueuedText\n    gearOcrBatchRunningText\n    gearOcrBatchReadyText\n    gearOcrBatchFailedText\n    gearOcrBatchImportedText\n    gearOcrBatchRetryLabel\n    gearOcrBatchRemoveLabel\n    gearOcrBatchAdjustLabel\n    gearOcrBatchApplyBoxLabel\n    gearOcrBatchDetectedText\n    gearOcrBatchFullImageText\n    gearOcrBatchDupTag\n    gearOcrBatchDupLibText\n    gearOcrBatchDupRowText\n    gearOcrBatchIncludeLabel\n    gearOcrBatchNoLinesText\n    gearOcrBatchImportTemplate\n    gearOcrBatchResultTemplate\n    gearLibEmptyText\n    gearEquippedTag\n    gearSchemeTitle\n    gearSchemeSaveLabel\n    gearSchemeNameTemplate\n    gearSchemeLoadLabel\n    gearSchemeDeleteLabel\n    gearSchemeEmptyText\n    gearSchemeComposeFirstText\n    gearSchemeSavedToastTemplate\n    gearSchemeLoadedToastTemplate\n    gearSchemeGroupCountTemplate\n    gearShareLabel\n    gearRevokeShareLabel\n    gearCopyLinkLabel\n    gearShareRevokedToast\n    gearCopiedToast\n    gearCopyFailedToast\n    gearSavedToastTemplate\n    gearDemoLoadedToast\n    gearDeletedToast\n    gearClearedToast\n    gearRecipeAllLabel\n    gearTargetLabel\n    gearGradLabel\n    gearYAccLabel\n    gearYCritLabel\n    gearYIntLabel\n    gearGearSlots\n    gearSchoolTags\n    gearBuilds {\n      idx\n      school\n      bowKind\n    }\n    gearBaseFields {\n      key\n      preset\n    }\n    gearAffixes {\n      key\n      label\n      max\n      cy\n    }\n    gearDingyinLeft {\n      name\n      max\n    }\n    gearDingyinRightMax\n    gearWuxueNames\n    gearDemoKit {\n      slot\n      name\n      keys\n      dingyinName\n      dingyinVal\n    }\n    gearPasteNames {\n      name\n      key\n    }\n    gearNameToClass {\n      name\n      cls\n    }\n    gearSlotAliases {\n      name\n      key\n    }\n    gearOcrAliases {\n      name\n      key\n    }\n  }\n  myGearItems {\n    id\n    slot\n    name\n    lines {\n      key\n      val\n    }\n    dingyin {\n      name\n      val\n    }\n    schools\n    warnings\n  }\n  myGearBuilds {\n    id\n    name\n    targetIdx\n    buildLabel\n    school\n    loadout {\n      slot\n      gearId\n    }\n    baseValues {\n      key\n      val\n    }\n    xinfa\n    res\n    extraAcc\n    extraCrit\n    extraInt\n    bowKind\n    gradDingyinOn\n    snapTotal\n    snapA\n    snapB\n    snapD\n    snapLoan\n    snapYAcc\n    snapYCrit\n    snapYInt\n    snapDawai\n    snapXiaowai\n    shareUrl\n  }\n}\n"
  }
};
})();

(node as any).hash = "f8b5ae23b286db0e8ee186c1f422d6d4";

export default node;
