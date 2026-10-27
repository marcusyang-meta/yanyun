/**
 * @generated SignedSource<<94605f08d80dc27472e9447afe6a152b>>
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
export type GroupingFormUpdateTemplateMutation$variables = {
  id: string;
  input: GroupingTemplateInput;
};
export type GroupingFormUpdateTemplateMutation$data = {
  readonly updateGroupingTemplate: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly template: {
      readonly id: string;
    } | null | undefined;
  };
};
export type GroupingFormUpdateTemplateMutation = {
  response: GroupingFormUpdateTemplateMutation$data;
  variables: GroupingFormUpdateTemplateMutation$variables;
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
    "name": "GroupingFormUpdateTemplateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingFormUpdateTemplateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "2bcea9dcd1479209531a53f0b9978959",
    "id": null,
    "metadata": {},
    "name": "GroupingFormUpdateTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingFormUpdateTemplateMutation(\n  $id: ID!\n  $input: GroupingTemplateInput!\n) {\n  updateGroupingTemplate(id: $id, input: $input) {\n    ok\n    error\n    template {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2634a2db05c24dff57aa1a358e896dbe";

export default node;
