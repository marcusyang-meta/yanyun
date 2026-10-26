/**
 * @generated SignedSource<<4b13db5c1a0ce6896a3085eb5eb6cfbd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type GroupingDetailQuery$variables = {
  id: string;
  slug?: string | null | undefined;
};
export type GroupingDetailQuery$data = {
  readonly groupingDetailPage: {
    readonly confirmCancelLabel: string;
    readonly confirmOkLabel: string;
    readonly detailBackToListLabel: string;
    readonly detailCompleteConfirmMessageTemplate: string;
    readonly detailCompleteConfirmTitle: string;
    readonly detailCompleteLabel: string;
    readonly detailCompletedHint: string;
    readonly detailCompletingLabel: string;
    readonly detailCopyFailedManual: string;
    readonly detailDisbandConfirmMessageTemplate: string;
    readonly detailDisbandConfirmTitle: string;
    readonly detailDisbandLabel: string;
    readonly detailDisbandingLabel: string;
    readonly detailEditLabel: string;
    readonly detailLinkCopied: string;
    readonly detailNotFoundText: string;
    readonly detailOpenHint: string;
    readonly detailPeopleTemplate: string;
    readonly detailReadonlyHint: string;
    readonly detailRestoreLabel: string;
    readonly detailShareLabel: string;
    readonly detailStatusCompletedLabel: string;
    readonly detailStatusOpenLabel: string;
    readonly detailToastCompleteFailedTemplate: string;
    readonly detailToastCompleted: string;
    readonly detailToastDisbandFailedTemplate: string;
    readonly detailToastDisbanded: string;
    readonly detailToastRestoreFailedTemplate: string;
    readonly detailToastRestored: string;
    readonly formCancelLabel: string;
    readonly formCapacityTemplate: string;
    readonly formCreateTitle: string;
    readonly formDayTemplate: string;
    readonly formDungeonLabel: string;
    readonly formDungeonNoneLabel: string;
    readonly formEditTitle: string;
    readonly formHintActivity: string;
    readonly formHintDungeonTemplate: string;
    readonly formHintRace: string;
    readonly formHintTalent: string;
    readonly formHintTower: string;
    readonly formHourTemplate: string;
    readonly formMinuteTemplate: string;
    readonly formMonthTemplate: string;
    readonly formNicknameLabel: string;
    readonly formNicknamePlaceholder: string;
    readonly formSectLabel: string;
    readonly formStartsLabel: string;
    readonly formSubmitCreateLabel: string;
    readonly formSubmitEditLabel: string;
    readonly formSubmittingLabel: string;
    readonly formTitleLabel: string;
    readonly formTitlePlaceholder: string;
    readonly formTitleTemplate: string;
    readonly formToastCreateFailedTemplate: string;
    readonly formToastPosted: string;
    readonly formToastSaveFailedTemplate: string;
    readonly formToastSaved: string;
    readonly formToastSect: string;
    readonly formTypeActivityLabel: string;
    readonly formTypeLabel: string;
    readonly formTypeRaceLabel: string;
    readonly formTypeTalentLabel: string;
    readonly formTypeTowerLabel: string;
    readonly grouping: {
      readonly creatorDiscordId: string | null | undefined;
      readonly dungeon: {
        readonly name: string;
      } | null | undefined;
      readonly id: string;
      readonly maxSlots: number;
      readonly occupiedCount: number;
      readonly seats: ReadonlyArray<{
        readonly index: number;
        readonly nickname: string | null | undefined;
        readonly occupied: boolean;
        readonly role: string | null | undefined;
        readonly uid: string | null | undefined;
        readonly weapon: string | null | undefined;
      }>;
      readonly startsAt: string;
      readonly status: string;
      readonly title: string;
      readonly type: GroupingType;
    };
    readonly seatCancelLabel: string;
    readonly seatConfirmJoinLabel: string;
    readonly seatEmptyJoinLabel: string;
    readonly seatEmptyLabel: string;
    readonly seatJoiningLabel: string;
    readonly seatLeaveConfirmMessageTemplate: string;
    readonly seatLeaveConfirmTitle: string;
    readonly seatModalSubtitle: string;
    readonly seatModalTitleTemplate: string;
    readonly seatNameLabel: string;
    readonly seatNamePlaceholder: string;
    readonly seatNameRequired: string;
    readonly seatSectLabel: string;
    readonly seatToastJoinFailedTemplate: string;
    readonly seatToastJoined: string;
    readonly seatToastLeaveFailedTemplate: string;
    readonly seatToastLeft: string;
    readonly seatToastSect: string;
    readonly typeShortActivity: string;
    readonly typeShortExplore: string;
    readonly typeShortGather: string;
    readonly typeShortRace: string;
    readonly typeShortTalent: string;
    readonly typeShortTower: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly user: {
      readonly discordId: string;
    } | null | undefined;
  };
};
export type GroupingDetailQuery = {
  response: GroupingDetailQuery$data;
  variables: GroupingDetailQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = {
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "commonUnknownErrorText",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailNotFoundText",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailBackToListLabel",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailShareLabel",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailEditLabel",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailDisbandLabel",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailDisbandingLabel",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailStatusOpenLabel",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailPeopleTemplate",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailOpenHint",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailReadonlyHint",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastDisbanded",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastDisbandFailedTemplate",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailLinkCopied",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCopyFailedManual",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailDisbandConfirmTitle",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailDisbandConfirmMessageTemplate",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompleteLabel",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompletingLabel",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailStatusCompletedLabel",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailRestoreLabel",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompleteConfirmTitle",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompleteConfirmMessageTemplate",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastCompleted",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastCompleteFailedTemplate",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastRestored",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastRestoreFailedTemplate",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompletedHint",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmOkLabel",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmCancelLabel",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortActivity",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortTalent",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortRace",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortTower",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortGather",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortExplore",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatEmptyJoinLabel",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatEmptyLabel",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatModalTitleTemplate",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatModalSubtitle",
  "storageKey": null
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatNameLabel",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatNamePlaceholder",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatNameRequired",
  "storageKey": null
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatSectLabel",
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatCancelLabel",
  "storageKey": null
},
v48 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatConfirmJoinLabel",
  "storageKey": null
},
v49 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatJoiningLabel",
  "storageKey": null
},
v50 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastSect",
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastJoined",
  "storageKey": null
},
v52 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastJoinFailedTemplate",
  "storageKey": null
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastLeft",
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastLeaveFailedTemplate",
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatLeaveConfirmTitle",
  "storageKey": null
},
v56 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatLeaveConfirmMessageTemplate",
  "storageKey": null
},
v57 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCreateTitle",
  "storageKey": null
},
v58 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formEditTitle",
  "storageKey": null
},
v59 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeLabel",
  "storageKey": null
},
v60 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeActivityLabel",
  "storageKey": null
},
v61 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeTalentLabel",
  "storageKey": null
},
v62 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeRaceLabel",
  "storageKey": null
},
v63 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeTowerLabel",
  "storageKey": null
},
v64 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCapacityTemplate",
  "storageKey": null
},
v65 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintActivity",
  "storageKey": null
},
v66 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintDungeonTemplate",
  "storageKey": null
},
v67 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintTalent",
  "storageKey": null
},
v68 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintRace",
  "storageKey": null
},
v69 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintTower",
  "storageKey": null
},
v70 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitleLabel",
  "storageKey": null
},
v71 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitlePlaceholder",
  "storageKey": null
},
v72 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formStartsLabel",
  "storageKey": null
},
v73 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formMonthTemplate",
  "storageKey": null
},
v74 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDayTemplate",
  "storageKey": null
},
v75 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHourTemplate",
  "storageKey": null
},
v76 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formMinuteTemplate",
  "storageKey": null
},
v77 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDungeonLabel",
  "storageKey": null
},
v78 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDungeonNoneLabel",
  "storageKey": null
},
v79 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formNicknameLabel",
  "storageKey": null
},
v80 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formNicknamePlaceholder",
  "storageKey": null
},
v81 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSectLabel",
  "storageKey": null
},
v82 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCancelLabel",
  "storageKey": null
},
v83 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmitCreateLabel",
  "storageKey": null
},
v84 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmitEditLabel",
  "storageKey": null
},
v85 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmittingLabel",
  "storageKey": null
},
v86 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSect",
  "storageKey": null
},
v87 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSaved",
  "storageKey": null
},
v88 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSaveFailedTemplate",
  "storageKey": null
},
v89 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastPosted",
  "storageKey": null
},
v90 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastCreateFailedTemplate",
  "storageKey": null
},
v91 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitleTemplate",
  "storageKey": null
},
v92 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v93 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v94 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v95 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "creatorDiscordId",
  "storageKey": null
},
v96 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startsAt",
  "storageKey": null
},
v97 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v98 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupiedCount",
  "storageKey": null
},
v99 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxSlots",
  "storageKey": null
},
v100 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v101 = {
  "alias": null,
  "args": null,
  "concreteType": "Seat",
  "kind": "LinkedField",
  "name": "seats",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "index",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "nickname",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "weapon",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "role",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "uid",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "occupied",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GroupingDetailQuery",
    "selections": [
      (v2/*:: as any*/),
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GroupingDetailPage",
        "kind": "LinkedField",
        "name": "groupingDetailPage",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          (v9/*:: as any*/),
          (v10/*:: as any*/),
          (v11/*:: as any*/),
          (v12/*:: as any*/),
          (v13/*:: as any*/),
          (v14/*:: as any*/),
          (v15/*:: as any*/),
          (v16/*:: as any*/),
          (v17/*:: as any*/),
          (v18/*:: as any*/),
          (v19/*:: as any*/),
          (v20/*:: as any*/),
          (v21/*:: as any*/),
          (v22/*:: as any*/),
          (v23/*:: as any*/),
          (v24/*:: as any*/),
          (v25/*:: as any*/),
          (v26/*:: as any*/),
          (v27/*:: as any*/),
          (v28/*:: as any*/),
          (v29/*:: as any*/),
          (v30/*:: as any*/),
          (v31/*:: as any*/),
          (v32/*:: as any*/),
          (v33/*:: as any*/),
          (v34/*:: as any*/),
          (v35/*:: as any*/),
          (v36/*:: as any*/),
          (v37/*:: as any*/),
          (v38/*:: as any*/),
          (v39/*:: as any*/),
          (v40/*:: as any*/),
          (v41/*:: as any*/),
          (v42/*:: as any*/),
          (v43/*:: as any*/),
          (v44/*:: as any*/),
          (v45/*:: as any*/),
          (v46/*:: as any*/),
          (v47/*:: as any*/),
          (v48/*:: as any*/),
          (v49/*:: as any*/),
          (v50/*:: as any*/),
          (v51/*:: as any*/),
          (v52/*:: as any*/),
          (v53/*:: as any*/),
          (v54/*:: as any*/),
          (v55/*:: as any*/),
          (v56/*:: as any*/),
          (v57/*:: as any*/),
          (v58/*:: as any*/),
          (v59/*:: as any*/),
          (v60/*:: as any*/),
          (v61/*:: as any*/),
          (v62/*:: as any*/),
          (v63/*:: as any*/),
          (v64/*:: as any*/),
          (v65/*:: as any*/),
          (v66/*:: as any*/),
          (v67/*:: as any*/),
          (v68/*:: as any*/),
          (v69/*:: as any*/),
          (v70/*:: as any*/),
          (v71/*:: as any*/),
          (v72/*:: as any*/),
          (v73/*:: as any*/),
          (v74/*:: as any*/),
          (v75/*:: as any*/),
          (v76/*:: as any*/),
          (v77/*:: as any*/),
          (v78/*:: as any*/),
          (v79/*:: as any*/),
          (v80/*:: as any*/),
          (v81/*:: as any*/),
          (v82/*:: as any*/),
          (v83/*:: as any*/),
          (v84/*:: as any*/),
          (v85/*:: as any*/),
          (v86/*:: as any*/),
          (v87/*:: as any*/),
          (v88/*:: as any*/),
          (v89/*:: as any*/),
          (v90/*:: as any*/),
          (v91/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Grouping",
            "kind": "LinkedField",
            "name": "grouping",
            "plural": false,
            "selections": [
              (v92/*:: as any*/),
              (v93/*:: as any*/),
              (v94/*:: as any*/),
              (v95/*:: as any*/),
              (v96/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Dungeon",
                "kind": "LinkedField",
                "name": "dungeon",
                "plural": false,
                "selections": [
                  (v97/*:: as any*/)
                ],
                "storageKey": null
              },
              (v98/*:: as any*/),
              (v99/*:: as any*/),
              (v100/*:: as any*/),
              (v101/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GroupingDetailQuery",
    "selections": [
      (v2/*:: as any*/),
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GroupingDetailPage",
        "kind": "LinkedField",
        "name": "groupingDetailPage",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          (v9/*:: as any*/),
          (v10/*:: as any*/),
          (v11/*:: as any*/),
          (v12/*:: as any*/),
          (v13/*:: as any*/),
          (v14/*:: as any*/),
          (v15/*:: as any*/),
          (v16/*:: as any*/),
          (v17/*:: as any*/),
          (v18/*:: as any*/),
          (v19/*:: as any*/),
          (v20/*:: as any*/),
          (v21/*:: as any*/),
          (v22/*:: as any*/),
          (v23/*:: as any*/),
          (v24/*:: as any*/),
          (v25/*:: as any*/),
          (v26/*:: as any*/),
          (v27/*:: as any*/),
          (v28/*:: as any*/),
          (v29/*:: as any*/),
          (v30/*:: as any*/),
          (v31/*:: as any*/),
          (v32/*:: as any*/),
          (v33/*:: as any*/),
          (v34/*:: as any*/),
          (v35/*:: as any*/),
          (v36/*:: as any*/),
          (v37/*:: as any*/),
          (v38/*:: as any*/),
          (v39/*:: as any*/),
          (v40/*:: as any*/),
          (v41/*:: as any*/),
          (v42/*:: as any*/),
          (v43/*:: as any*/),
          (v44/*:: as any*/),
          (v45/*:: as any*/),
          (v46/*:: as any*/),
          (v47/*:: as any*/),
          (v48/*:: as any*/),
          (v49/*:: as any*/),
          (v50/*:: as any*/),
          (v51/*:: as any*/),
          (v52/*:: as any*/),
          (v53/*:: as any*/),
          (v54/*:: as any*/),
          (v55/*:: as any*/),
          (v56/*:: as any*/),
          (v57/*:: as any*/),
          (v58/*:: as any*/),
          (v59/*:: as any*/),
          (v60/*:: as any*/),
          (v61/*:: as any*/),
          (v62/*:: as any*/),
          (v63/*:: as any*/),
          (v64/*:: as any*/),
          (v65/*:: as any*/),
          (v66/*:: as any*/),
          (v67/*:: as any*/),
          (v68/*:: as any*/),
          (v69/*:: as any*/),
          (v70/*:: as any*/),
          (v71/*:: as any*/),
          (v72/*:: as any*/),
          (v73/*:: as any*/),
          (v74/*:: as any*/),
          (v75/*:: as any*/),
          (v76/*:: as any*/),
          (v77/*:: as any*/),
          (v78/*:: as any*/),
          (v79/*:: as any*/),
          (v80/*:: as any*/),
          (v81/*:: as any*/),
          (v82/*:: as any*/),
          (v83/*:: as any*/),
          (v84/*:: as any*/),
          (v85/*:: as any*/),
          (v86/*:: as any*/),
          (v87/*:: as any*/),
          (v88/*:: as any*/),
          (v89/*:: as any*/),
          (v90/*:: as any*/),
          (v91/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Grouping",
            "kind": "LinkedField",
            "name": "grouping",
            "plural": false,
            "selections": [
              (v92/*:: as any*/),
              (v93/*:: as any*/),
              (v94/*:: as any*/),
              (v95/*:: as any*/),
              (v96/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Dungeon",
                "kind": "LinkedField",
                "name": "dungeon",
                "plural": false,
                "selections": [
                  (v97/*:: as any*/),
                  (v92/*:: as any*/)
                ],
                "storageKey": null
              },
              (v98/*:: as any*/),
              (v99/*:: as any*/),
              (v100/*:: as any*/),
              (v101/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4ad14f6c470c125c171b30e090196c72",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailQuery",
    "operationKind": "query",
    "text": "query GroupingDetailQuery(\n  $slug: String\n  $id: ID!\n) {\n  viewer {\n    user {\n      discordId\n    }\n    commonUnknownErrorText\n  }\n  groupingDetailPage(slug: $slug, id: $id) {\n    detailNotFoundText\n    detailBackToListLabel\n    detailShareLabel\n    detailEditLabel\n    detailDisbandLabel\n    detailDisbandingLabel\n    detailStatusOpenLabel\n    detailPeopleTemplate\n    detailOpenHint\n    detailReadonlyHint\n    detailToastDisbanded\n    detailToastDisbandFailedTemplate\n    detailLinkCopied\n    detailCopyFailedManual\n    detailDisbandConfirmTitle\n    detailDisbandConfirmMessageTemplate\n    detailCompleteLabel\n    detailCompletingLabel\n    detailStatusCompletedLabel\n    detailRestoreLabel\n    detailCompleteConfirmTitle\n    detailCompleteConfirmMessageTemplate\n    detailToastCompleted\n    detailToastCompleteFailedTemplate\n    detailToastRestored\n    detailToastRestoreFailedTemplate\n    detailCompletedHint\n    confirmOkLabel\n    confirmCancelLabel\n    typeShortActivity\n    typeShortTalent\n    typeShortRace\n    typeShortTower\n    typeShortGather\n    typeShortExplore\n    seatEmptyJoinLabel\n    seatEmptyLabel\n    seatModalTitleTemplate\n    seatModalSubtitle\n    seatNameLabel\n    seatNamePlaceholder\n    seatNameRequired\n    seatSectLabel\n    seatCancelLabel\n    seatConfirmJoinLabel\n    seatJoiningLabel\n    seatToastSect\n    seatToastJoined\n    seatToastJoinFailedTemplate\n    seatToastLeft\n    seatToastLeaveFailedTemplate\n    seatLeaveConfirmTitle\n    seatLeaveConfirmMessageTemplate\n    formCreateTitle\n    formEditTitle\n    formTypeLabel\n    formTypeActivityLabel\n    formTypeTalentLabel\n    formTypeRaceLabel\n    formTypeTowerLabel\n    formCapacityTemplate\n    formHintActivity\n    formHintDungeonTemplate\n    formHintTalent\n    formHintRace\n    formHintTower\n    formTitleLabel\n    formTitlePlaceholder\n    formStartsLabel\n    formMonthTemplate\n    formDayTemplate\n    formHourTemplate\n    formMinuteTemplate\n    formDungeonLabel\n    formDungeonNoneLabel\n    formNicknameLabel\n    formNicknamePlaceholder\n    formSectLabel\n    formCancelLabel\n    formSubmitCreateLabel\n    formSubmitEditLabel\n    formSubmittingLabel\n    formToastSect\n    formToastSaved\n    formToastSaveFailedTemplate\n    formToastPosted\n    formToastCreateFailedTemplate\n    formTitleTemplate\n    grouping {\n      id\n      title\n      type\n      creatorDiscordId\n      startsAt\n      dungeon {\n        name\n        id\n      }\n      occupiedCount\n      maxSlots\n      status\n      seats {\n        index\n        nickname\n        weapon\n        role\n        uid\n        occupied\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d0a54e488c752b284a46aa59d052758e";

export default node;
