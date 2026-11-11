/**
 * @generated SignedSource<<56fb10dceaf716a82b0a94d2b7e78530>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "EXPLORE" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type UpdateAdminEventInput = {
  description?: string | null | undefined;
  dungeon?: string | null | undefined;
  maxSlots?: number | null | undefined;
  meetInfo?: string | null | undefined;
  startsAtUtc?: number | null | undefined;
  status?: string | null | undefined;
  title?: string | null | undefined;
  type?: GroupingType | null | undefined;
};
export type documentsUpdateAdminEventMutation$variables = {
  eventId: string;
  input: UpdateAdminEventInput;
  slug: string;
};
export type documentsUpdateAdminEventMutation$data = {
  readonly updateAdminEvent: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateAdminEventMutation = {
  response: documentsUpdateAdminEventMutation$data;
  variables: documentsUpdateAdminEventMutation$variables;
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
  "name": "input"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "eventId",
    "variableName": "eventId"
  },
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v5 = {
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
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsUpdateAdminEventMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateAdminEvent",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/)
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
      (v2/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsUpdateAdminEventMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateAdminEvent",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
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
    "cacheID": "3953319065e61e34f3aadb3dbeb869a4",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateAdminEventMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateAdminEventMutation(\n  $slug: String!\n  $eventId: ID!\n  $input: UpdateAdminEventInput!\n) {\n  updateAdminEvent(slug: $slug, eventId: $eventId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "bf94876c2e9c36515eb1e24655a56e7d";

export default node;
