/**
 * @generated SignedSource<<16ea9a7765681d267798707a618e378d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type CreateGroupingTemplateInput = {
  dungeonId?: string | null | undefined;
  name: string;
  slug: string;
  startHour: number;
  startMinute: number;
  startsInDays: number;
  title: string;
  type: GroupingType;
};
export type GroupingFormCreateTemplateMutation$variables = {
  input: CreateGroupingTemplateInput;
};
export type GroupingFormCreateTemplateMutation$data = {
  readonly createGroupingTemplate: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly template: {
      readonly id: string;
    } | null | undefined;
  };
};
export type GroupingFormCreateTemplateMutation = {
  response: GroupingFormCreateTemplateMutation$data;
  variables: GroupingFormCreateTemplateMutation$variables;
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
    "name": "createGroupingTemplate",
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
    "name": "GroupingFormCreateTemplateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingFormCreateTemplateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "b9a996f0052f168088188c0d1942a11c",
    "id": null,
    "metadata": {},
    "name": "GroupingFormCreateTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingFormCreateTemplateMutation(\n  $input: CreateGroupingTemplateInput!\n) {\n  createGroupingTemplate(input: $input) {\n    ok\n    error\n    template {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3ecbd9fdab906e3c5ca3b6be7c413edf";

export default node;
