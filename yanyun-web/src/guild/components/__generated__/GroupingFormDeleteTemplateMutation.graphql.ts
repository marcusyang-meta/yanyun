/**
 * @generated SignedSource<<26a3f31dc7e7114e94d43951de6f346b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingFormDeleteTemplateMutation$variables = {
  id: string;
};
export type GroupingFormDeleteTemplateMutation$data = {
  readonly deleteGroupingTemplate: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GroupingFormDeleteTemplateMutation = {
  response: GroupingFormDeleteTemplateMutation$data;
  variables: GroupingFormDeleteTemplateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
      }
    ],
    "concreteType": "DeletePayload",
    "kind": "LinkedField",
    "name": "deleteGroupingTemplate",
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
    "name": "GroupingFormDeleteTemplateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingFormDeleteTemplateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "7fbadfb0b6d8f13ba3d8cc6a3ff31267",
    "id": null,
    "metadata": {},
    "name": "GroupingFormDeleteTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingFormDeleteTemplateMutation(\n  $id: ID!\n) {\n  deleteGroupingTemplate(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "ceef205e394be44b7d7ebdfa693cbd13";

export default node;
