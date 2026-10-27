/**
 * @generated SignedSource<<bb5463ddce97226e4cdc0b71aeec7c44>>
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
export type GroupingDetailSaveTemplateMutation$variables = {
  input: SaveGroupingTemplateInput;
};
export type GroupingDetailSaveTemplateMutation$data = {
  readonly saveGroupingTemplate: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly template: {
      readonly id: string;
    } | null | undefined;
  };
};
export type GroupingDetailSaveTemplateMutation = {
  response: GroupingDetailSaveTemplateMutation$data;
  variables: GroupingDetailSaveTemplateMutation$variables;
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
    "name": "GroupingDetailSaveTemplateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingDetailSaveTemplateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "a95f369b3c2357277f561ae9fba7efc5",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailSaveTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailSaveTemplateMutation(\n  $input: SaveGroupingTemplateInput!\n) {\n  saveGroupingTemplate(input: $input) {\n    ok\n    error\n    template {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6c6cd55f2c6e981981bf63922e934cdd";

export default node;
