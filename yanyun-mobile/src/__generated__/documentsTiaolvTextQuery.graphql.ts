/**
 * @generated SignedSource<<c9a6102b6d7880b454fff315be75e1fd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsTiaolvTextQuery$variables = Record<PropertyKey, never>;
export type documentsTiaolvTextQuery$data = {
  readonly tiaolvPage: {
    readonly innerSkills: ReadonlyArray<string>;
    readonly suits: ReadonlyArray<string>;
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
export type documentsTiaolvTextQuery = {
  response: documentsTiaolvTextQuery$data;
  variables: documentsTiaolvTextQuery$variables;
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "suits",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "innerSkills",
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
    "name": "documentsTiaolvTextQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsTiaolvTextQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "d669f4c6f30ec8482a8db18e6fb34e61",
    "id": null,
    "metadata": {},
    "name": "documentsTiaolvTextQuery",
    "operationKind": "query",
    "text": "query documentsTiaolvTextQuery {\n  tiaolvPage {\n    tlIntroText\n    tlInnerSkillTemplate\n    tlInnerSkillPlaceholder\n    tlWuxueLabel\n    tlWukuLabel\n    tlWukuSelfLabel\n    tlWukuCommonLabel\n    tlSuitLabel\n    tlBowLabel\n    tlNoneLabel\n    tlTuneAreaLabel\n    tlCalcLabel\n    tlCalculatingLabel\n    tlToastFailedText\n    tlToastFailedWithTemplate\n    tlColAttrLabel\n    tlColBaseLabel\n    tlColPanelLabel\n    tlColFinalLabel\n    suits\n    innerSkills\n  }\n}\n"
  }
};
})();

(node as any).hash = "18527dee159ad00dd43f42f105616c1a";

export default node;
