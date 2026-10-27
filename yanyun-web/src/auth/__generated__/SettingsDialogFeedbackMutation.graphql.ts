/**
 * @generated SignedSource<<e1401f3b7f262443f0e6a1c9d4e90950>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FeedbackCategory = "OTHER" | "PROBLEM" | "SUGGESTION" | "%future added value";
export type SettingsDialogFeedbackMutation$variables = {
  category: FeedbackCategory;
  text: string;
};
export type SettingsDialogFeedbackMutation$data = {
  readonly submitFeedback: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogFeedbackMutation = {
  response: SettingsDialogFeedbackMutation$data;
  variables: SettingsDialogFeedbackMutation$variables;
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
    "name": "SettingsDialogFeedbackMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SettingsDialogFeedbackMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "30331f65c5db65211d3895a021275fba",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogFeedbackMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogFeedbackMutation(\n  $category: FeedbackCategory!\n  $text: String!\n) {\n  submitFeedback(category: $category, text: $text) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "029800537de6ca84e98443387d2cb5be";

export default node;
