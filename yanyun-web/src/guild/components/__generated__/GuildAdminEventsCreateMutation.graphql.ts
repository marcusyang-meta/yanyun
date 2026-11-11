/**
 * @generated SignedSource<<a20270c9d258c919c8492eb568de83ab>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "EXPLORE" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type CreateAdminEventInput = {
  description?: string | null | undefined;
  dungeon?: string | null | undefined;
  maxSlots?: number | null | undefined;
  meetInfo?: string | null | undefined;
  startsAtUtc?: number | null | undefined;
  status?: string | null | undefined;
  title: string;
  type: GroupingType;
};
export type GuildAdminEventsCreateMutation$variables = {
  input: CreateAdminEventInput;
  slug: string;
};
export type GuildAdminEventsCreateMutation$data = {
  readonly createAdminEvent: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminEventsCreateMutation = {
  response: GuildAdminEventsCreateMutation$data;
  variables: GuildAdminEventsCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "alias": null,
    "args": [
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
    "concreteType": "GuildAdminPayload",
    "kind": "LinkedField",
    "name": "createAdminEvent",
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
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminEventsCreateMutation",
    "selections": (v2/*:: as any*/),
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
    "name": "GuildAdminEventsCreateMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "69c1908c0716774d0f1c7a8ff1a9e2e6",
    "id": null,
    "metadata": {},
    "name": "GuildAdminEventsCreateMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminEventsCreateMutation(\n  $slug: String!\n  $input: CreateAdminEventInput!\n) {\n  createAdminEvent(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "dbd3becbcaf7575b798b3f1487de061e";

export default node;
