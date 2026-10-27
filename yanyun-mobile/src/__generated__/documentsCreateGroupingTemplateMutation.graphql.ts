/**
 * @generated SignedSource<<c82e802538aa8dda1f253fe5d8a58806>>
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
export type documentsCreateGroupingTemplateMutation$variables = {
  input: CreateGroupingTemplateInput;
};
export type documentsCreateGroupingTemplateMutation$data = {
  readonly createGroupingTemplate: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly template: {
      readonly id: string;
    } | null | undefined;
  };
};
export type documentsCreateGroupingTemplateMutation = {
  response: documentsCreateGroupingTemplateMutation$data;
  variables: documentsCreateGroupingTemplateMutation$variables;
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
    "name": "documentsCreateGroupingTemplateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsCreateGroupingTemplateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "623ccbd65f6f6d84828c31d0cec3e7b4",
    "id": null,
    "metadata": {},
    "name": "documentsCreateGroupingTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCreateGroupingTemplateMutation(\n  $input: CreateGroupingTemplateInput!\n) {\n  createGroupingTemplate(input: $input) {\n    ok\n    error\n    template {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "098acc1ae6bac4aff8626abfa5829d74";

export default node;
