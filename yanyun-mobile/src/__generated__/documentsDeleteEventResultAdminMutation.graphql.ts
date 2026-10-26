/**
 * @generated SignedSource<<346226e1ce07bbbbb988827e3a258ab4>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteEventResultAdminMutation$variables = {
  resultId: string;
  slug: string;
};
export type documentsDeleteEventResultAdminMutation$data = {
  readonly deleteEventResult: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteEventResultAdminMutation = {
  response: documentsDeleteEventResultAdminMutation$data;
  variables: documentsDeleteEventResultAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resultId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "resultId",
    "variableName": "resultId"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsDeleteEventResultAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteEventResult",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsDeleteEventResultAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteEventResult",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
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
    ]
  },
  "params": {
    "cacheID": "615ce60a8e8a43b0995fb3b033f5dd33",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteEventResultAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteEventResultAdminMutation(\n  $slug: String!\n  $resultId: ID!\n) {\n  deleteEventResult(slug: $slug, resultId: $resultId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "89d9f4af559ceb807c01b97f43374f72";

export default node;
