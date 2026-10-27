/**
 * @generated SignedSource<<1a4a65543ed44184c76a5d1918b5148d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SaveGroupingTemplateInput = {
  groupingId: string;
  name?: string | null | undefined;
};
export type documentsSaveGroupingTemplateMutation$variables = {
  input: SaveGroupingTemplateInput;
};
export type documentsSaveGroupingTemplateMutation$data = {
  readonly saveGroupingTemplate: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly template: {
      readonly id: string;
    } | null | undefined;
  };
};
export type documentsSaveGroupingTemplateMutation = {
  response: documentsSaveGroupingTemplateMutation$data;
  variables: documentsSaveGroupingTemplateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "GroupingTemplatePayload",
    "kind": "LinkedField",
    "name": "saveGroupingTemplate",
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
        "concreteType": "GroupingTemplate",
        "kind": "LinkedField",
        "name": "template",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsSaveGroupingTemplateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsSaveGroupingTemplateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "a855287baa466f2bb6fb8db7f015c5c1",
    "id": null,
    "metadata": {},
    "name": "documentsSaveGroupingTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation documentsSaveGroupingTemplateMutation(\n  $input: SaveGroupingTemplateInput!\n) {\n  saveGroupingTemplate(input: $input) {\n    ok\n    error\n    template {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5ed446c4060468f9547cc9ffa4a0cd5e";

export default node;
