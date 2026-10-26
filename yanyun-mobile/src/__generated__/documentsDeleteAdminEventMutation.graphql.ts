/**
 * @generated SignedSource<<5aacf6b01e80bf375c1ec7710646127e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteAdminEventMutation$variables = {
  eventId: string;
  slug: string;
};
export type documentsDeleteAdminEventMutation$data = {
  readonly deleteAdminEvent: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteAdminEventMutation = {
  response: documentsDeleteAdminEventMutation$data;
  variables: documentsDeleteAdminEventMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "eventId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "eventId",
    "variableName": "eventId"
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
    "name": "documentsDeleteAdminEventMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteAdminEvent",
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
    "name": "documentsDeleteAdminEventMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteAdminEvent",
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
    "cacheID": "314a8de13f5cbc9f3be74283f40eaab8",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteAdminEventMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteAdminEventMutation(\n  $slug: String!\n  $eventId: ID!\n) {\n  deleteAdminEvent(slug: $slug, eventId: $eventId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e0c57cb09db0d838995f5274ab26a0c1";

export default node;
