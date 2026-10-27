/**
 * @generated SignedSource<<5b1b0287e4f2f8b06c5839706068f639>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type GroupingTemplateInput = {
  dungeonId?: string | null | undefined;
  name: string;
  startHour: number;
  startMinute: number;
  startsInDays: number;
  title: string;
  type: GroupingType;
};
export type documentsUpdateGroupingTemplateMutation$variables = {
  id: string;
  input: GroupingTemplateInput;
};
export type documentsUpdateGroupingTemplateMutation$data = {
  readonly updateGroupingTemplate: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly template: {
      readonly id: string;
    } | null | undefined;
  };
};
export type documentsUpdateGroupingTemplateMutation = {
  response: documentsUpdateGroupingTemplateMutation$data;
  variables: documentsUpdateGroupingTemplateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "GroupingTemplatePayload",
    "kind": "LinkedField",
    "name": "updateGroupingTemplate",
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
    "name": "documentsUpdateGroupingTemplateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsUpdateGroupingTemplateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "27124dace7f650323ebbab6438aac0e1",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGroupingTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGroupingTemplateMutation(\n  $id: ID!\n  $input: GroupingTemplateInput!\n) {\n  updateGroupingTemplate(id: $id, input: $input) {\n    ok\n    error\n    template {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "38e2ae20de0b1e757a7609f8112f980b";

export default node;
