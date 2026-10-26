/**
 * @generated SignedSource<<750409ceb2b36b745f56196904c3207d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
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
export type documentsCreateAdminEventMutation$variables = {
  input: CreateAdminEventInput;
  slug: string;
};
export type documentsCreateAdminEventMutation$data = {
  readonly createAdminEvent: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsCreateAdminEventMutation = {
  response: documentsCreateAdminEventMutation$data;
  variables: documentsCreateAdminEventMutation$variables;
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
    "name": "documentsCreateAdminEventMutation",
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
    "name": "documentsCreateAdminEventMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "a9a549fef02ce945b89c696cee483727",
    "id": null,
    "metadata": {},
    "name": "documentsCreateAdminEventMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCreateAdminEventMutation(\n  $slug: String!\n  $input: CreateAdminEventInput!\n) {\n  createAdminEvent(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1ccc54a56d954bb2869fd4877c746bbb";

export default node;
