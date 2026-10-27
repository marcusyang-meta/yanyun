/**
 * @generated SignedSource<<5c2b537be71ff71ada1957401a8369dd>>
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
    readonly tlBowOptions: ReadonlyArray<{
      readonly id: string;
      readonly isDefault: boolean;
      readonly label: string;
    }>;
    readonly tlCalcLabel: string;
    readonly tlCalculatingLabel: string;
    readonly tlColAttrLabel: string;
    readonly tlColBaseLabel: string;
    readonly tlColFinalLabel: string;
    readonly tlColPanelLabel: string;
    readonly tlInnerSkillPlaceholder: string;
    readonly tlInnerSkillTemplate: string;
    readonly tlIntroText: string;
    readonly tlSectWuxue: ReadonlyArray<{
      readonly sectSlug: string;
      readonly wuxue: string;
    }>;
    readonly tlSuitLabel: string;
    readonly tlSuitOptions: ReadonlyArray<{
      readonly id: string;
      readonly isDefault: boolean;
      readonly label: string;
    }>;
    readonly tlToastFailedText: string;
    readonly tlToastFailedWithTemplate: string;
    readonly tlTuneAreaLabel: string;
    readonly tlTuneRows: ReadonlyArray<{
      readonly label: string;
      readonly row: number;
    }>;
    readonly tlWukuLabel: string;
    readonly tlWukuOptions: ReadonlyArray<{
      readonly id: string;
      readonly isDefault: boolean;
      readonly label: string;
    }>;
    readonly tlWuxueLabel: string;
  };
};
export type TiaolvTabTextQuery = {
  response: TiaolvTabTextQuery$data;
  variables: TiaolvTabTextQuery$variables;
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
    "name": "id",
    "storageKey": null
  },
  (v0/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "isDefault",
    "storageKey": null
  }
],
v2 = [
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
        "concreteType": "TiaolvVocabOption",
        "kind": "LinkedField",
        "name": "tlSuitOptions",
        "plural": true,
        "selections": (v1/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "TiaolvVocabOption",
        "kind": "LinkedField",
        "name": "tlBowOptions",
        "plural": true,
        "selections": (v1/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "TiaolvVocabOption",
        "kind": "LinkedField",
        "name": "tlWukuOptions",
        "plural": true,
        "selections": (v1/*:: as any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "TiaolvTuneRow",
        "kind": "LinkedField",
        "name": "tlTuneRows",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "row",
            "storageKey": null
          },
          (v0/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "TiaolvSectWuxue",
        "kind": "LinkedField",
        "name": "tlSectWuxue",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "sectSlug",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "wuxue",
            "storageKey": null
          }
        ],
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
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "TiaolvTabTextQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "37c73ad33bd87e0417c46ebdc6012897",
    "id": null,
    "metadata": {},
    "name": "TiaolvTabTextQuery",
    "operationKind": "query",
    "text": "query TiaolvTabTextQuery {\n  tiaolvPage {\n    tlIntroText\n    tlInnerSkillTemplate\n    tlInnerSkillPlaceholder\n    tlWuxueLabel\n    tlWukuLabel\n    tlSuitLabel\n    tlBowLabel\n    tlSuitOptions {\n      id\n      label\n      isDefault\n    }\n    tlBowOptions {\n      id\n      label\n      isDefault\n    }\n    tlWukuOptions {\n      id\n      label\n      isDefault\n    }\n    tlTuneRows {\n      row\n      label\n    }\n    tlSectWuxue {\n      sectSlug\n      wuxue\n    }\n    tlTuneAreaLabel\n    tlCalcLabel\n    tlCalculatingLabel\n    tlToastFailedText\n    tlToastFailedWithTemplate\n    tlColAttrLabel\n    tlColBaseLabel\n    tlColPanelLabel\n    tlColFinalLabel\n  }\n}\n"
  }
};
})();

(node as any).hash = "9a488d8d7219a8ffa9236c042f86e98d";

export default node;
