/**
 * @generated SignedSource<<2d38d38fca87eacd555ff0f288f99f63>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FeedbackCategory = "OTHER" | "PROBLEM" | "SUGGESTION" | "%future added value";
export type documentsSubmitFeedbackMutation$variables = {
  category: FeedbackCategory;
  text: string;
};
export type documentsSubmitFeedbackMutation$data = {
  readonly submitFeedback: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsSubmitFeedbackMutation = {
  response: documentsSubmitFeedbackMutation$data;
  variables: documentsSubmitFeedbackMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "category"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "text"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "category",
        "variableName": "category"
      },
      {
        "kind": "Variable",
        "name": "text",
        "variableName": "text"
      }
    ],
    "concreteType": "SubmitFeedbackPayload",
    "kind": "LinkedField",
    "name": "submitFeedback",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "errorCode",
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
    "name": "documentsSubmitFeedbackMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsSubmitFeedbackMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "1e8d9b6611663ca8cd625cf757a0c7e6",
    "id": null,
    "metadata": {},
    "name": "documentsSubmitFeedbackMutation",
    "operationKind": "mutation",
    "text": "mutation documentsSubmitFeedbackMutation(\n  $category: FeedbackCategory!\n  $text: String!\n) {\n  submitFeedback(category: $category, text: $text) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "6dd859a297e02516b56c9e40a9d30d60";

export default node;
