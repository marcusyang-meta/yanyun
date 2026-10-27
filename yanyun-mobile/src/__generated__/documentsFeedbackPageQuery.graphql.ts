/**
 * @generated SignedSource<<43679afab39778e3f533c9460d5f61bb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsFeedbackPageQuery$variables = Record<PropertyKey, never>;
export type documentsFeedbackPageQuery$data = {
  readonly settingsPage: {
    readonly feedbackCategoryLabel: string;
    readonly feedbackCategoryOtherLabel: string;
    readonly feedbackCategoryProblemLabel: string;
    readonly feedbackCategorySuggestionLabel: string;
    readonly feedbackPlaceholder: string;
    readonly feedbackSubmitLabel: string;
    readonly feedbackSubmittingLabel: string;
    readonly feedbackSuccessText: string;
    readonly feedbackTitle: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
  };
};
export type documentsFeedbackPageQuery = {
  response: documentsFeedbackPageQuery$data;
  variables: documentsFeedbackPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
        "kind": "ScalarField",
        "name": "commonUnknownErrorText",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "SettingsPage",
    "kind": "LinkedField",
    "name": "settingsPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackCategoryLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackCategoryProblemLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackCategorySuggestionLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackCategoryOtherLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackSubmitLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackSubmittingLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "feedbackSuccessText",
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
    "name": "documentsFeedbackPageQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsFeedbackPageQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "58c83966e1b944283a93dd009f3a734e",
    "id": null,
    "metadata": {},
    "name": "documentsFeedbackPageQuery",
    "operationKind": "query",
    "text": "query documentsFeedbackPageQuery {\n  viewer {\n    commonUnknownErrorText\n  }\n  settingsPage {\n    feedbackTitle\n    feedbackCategoryLabel\n    feedbackCategoryProblemLabel\n    feedbackCategorySuggestionLabel\n    feedbackCategoryOtherLabel\n    feedbackPlaceholder\n    feedbackSubmitLabel\n    feedbackSubmittingLabel\n    feedbackSuccessText\n  }\n}\n"
  }
};
})();

(node as any).hash = "dc062f7c9f3dbf7cda80022ac3e4e94c";

export default node;
