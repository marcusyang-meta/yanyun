/**
 * @generated SignedSource<<a8a555ac82416830e7a631b8593953ad>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteGroupingTemplateMutation$variables = {
  id: string;
};
export type documentsDeleteGroupingTemplateMutation$data = {
  readonly deleteGroupingTemplate: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteGroupingTemplateMutation = {
  response: documentsDeleteGroupingTemplateMutation$data;
  variables: documentsDeleteGroupingTemplateMutation$variables;
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
    "name": "documentsDeleteGroupingTemplateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsDeleteGroupingTemplateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "d947d02109ce01c81049290fda842fa5",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteGroupingTemplateMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteGroupingTemplateMutation(\n  $id: ID!\n) {\n  deleteGroupingTemplate(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "ee8ba256a5da6c369332a3ec4ae2d958";

export default node;
