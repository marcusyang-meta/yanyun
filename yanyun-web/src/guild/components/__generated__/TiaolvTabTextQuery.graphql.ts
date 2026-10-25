/**
 * @generated SignedSource<<6b404a74ef22b95934218985a16bc09e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TiaolvTabTextQuery$variables = Record<PropertyKey, never>;
export type TiaolvTabTextQuery$data = {
  readonly tiaolvPage: {
    readonly tlBowLabel: string;
    readonly tlCalcLabel: string;
    readonly tlCalculatingLabel: string;
    readonly tlColAttrLabel: string;
    readonly tlColBaseLabel: string;
    readonly tlColFinalLabel: string;
    readonly tlColPanelLabel: string;
    readonly tlInnerSkillPlaceholder: string;
    readonly tlInnerSkillTemplate: string;
    readonly tlIntroText: string;
    readonly tlNoneLabel: string;
    readonly tlSuitLabel: string;
    readonly tlToastFailedText: string;
    readonly tlToastFailedWithTemplate: string;
    readonly tlTuneAreaLabel: string;
    readonly tlWukuCommonLabel: string;
    readonly tlWukuLabel: string;
    readonly tlWukuSelfLabel: string;
    readonly tlWuxueLabel: string;
  };
};
export type TiaolvTabTextQuery = {
  response: TiaolvTabTextQuery$data;
  variables: TiaolvTabTextQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "TiaolvPage",
    "kind": "LinkedField",
    "name": "tiaolvPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlIntroText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlInnerSkillTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlInnerSkillPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlWuxueLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlWukuLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlWukuSelfLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlWukuCommonLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlSuitLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlBowLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlNoneLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlTuneAreaLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlCalcLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlCalculatingLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlToastFailedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlToastFailedWithTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlColAttrLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlColBaseLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlColPanelLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tlColFinalLabel",
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
    "name": "TiaolvTabTextQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "TiaolvTabTextQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "700aa73d2b03d765f060ba7a50cea396",
    "id": null,
    "metadata": {},
    "name": "TiaolvTabTextQuery",
    "operationKind": "query",
    "text": "query TiaolvTabTextQuery {\n  tiaolvPage {\n    tlIntroText\n    tlInnerSkillTemplate\n    tlInnerSkillPlaceholder\n    tlWuxueLabel\n    tlWukuLabel\n    tlWukuSelfLabel\n    tlWukuCommonLabel\n    tlSuitLabel\n    tlBowLabel\n    tlNoneLabel\n    tlTuneAreaLabel\n    tlCalcLabel\n    tlCalculatingLabel\n    tlToastFailedText\n    tlToastFailedWithTemplate\n    tlColAttrLabel\n    tlColBaseLabel\n    tlColPanelLabel\n    tlColFinalLabel\n  }\n}\n"
  }
};
})();

(node as any).hash = "0ece52f08d2aee4a0a76f1b475609e1d";

export default node;
