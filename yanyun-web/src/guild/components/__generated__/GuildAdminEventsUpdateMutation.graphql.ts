/**
 * @generated SignedSource<<052e1e32c72ae7da6820eb9d31edc70f>>
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
export type GuildAdminEventsUpdateMutation$variables = {
  eventId: string;
  input: UpdateAdminEventInput;
  slug: string;
};
export type GuildAdminEventsUpdateMutation$data = {
  readonly updateAdminEvent: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminEventsUpdateMutation = {
  response: GuildAdminEventsUpdateMutation$data;
  variables: GuildAdminEventsUpdateMutation$variables;
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
    "name": "GuildAdminEventsUpdateMutation",
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
    "name": "GuildAdminEventsUpdateMutation",
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
    "cacheID": "02c2c504b982813b597bd244863f50fe",
    "id": null,
    "metadata": {},
    "name": "GuildAdminEventsUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminEventsUpdateMutation(\n  $slug: String!\n  $eventId: ID!\n  $input: UpdateAdminEventInput!\n) {\n  updateAdminEvent(slug: $slug, eventId: $eventId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e21f10d21241a9117e67c1e39f460a58";

export default node;
