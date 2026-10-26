/**
 * @generated SignedSource<<e4b8a35978c25bb457ef2cfea974cffd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AddEventResultInput = {
  members?: string | null | undefined;
  note?: string | null | undefined;
  proofUrl?: string | null | undefined;
  teamName: string;
  timeText: string;
};
export type GuildAdminEventsAddResultMutation$variables = {
  eventId: string;
  input: AddEventResultInput;
  slug: string;
};
export type GuildAdminEventsAddResultMutation$data = {
  readonly addEventResult: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminEventsAddResultMutation = {
  response: GuildAdminEventsAddResultMutation$data;
  variables: GuildAdminEventsAddResultMutation$variables;
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
    "alias": null,
    "args": [
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
    "concreteType": "GuildAdminPayload",
    "kind": "LinkedField",
    "name": "addEventResult",
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
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminEventsAddResultMutation",
    "selections": (v3/*:: as any*/),
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
    "name": "GuildAdminEventsAddResultMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "550c9b152e72572910f1464f7e05c49f",
    "id": null,
    "metadata": {},
    "name": "GuildAdminEventsAddResultMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminEventsAddResultMutation(\n  $slug: String!\n  $eventId: ID!\n  $input: AddEventResultInput!\n) {\n  addEventResult(slug: $slug, eventId: $eventId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "52751d3771688e57c489d67c6624f81c";

export default node;
