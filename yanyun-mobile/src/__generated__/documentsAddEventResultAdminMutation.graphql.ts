/**
 * @generated SignedSource<<7c2671a4d9d6d047dee0bd98a78b626a>>
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
export type documentsAddEventResultAdminMutation$variables = {
  eventId: string;
  input: AddEventResultInput;
  slug: string;
};
export type documentsAddEventResultAdminMutation$data = {
  readonly addEventResult: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsAddEventResultAdminMutation = {
  response: documentsAddEventResultAdminMutation$data;
  variables: documentsAddEventResultAdminMutation$variables;
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
    "name": "documentsAddEventResultAdminMutation",
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
    "name": "documentsAddEventResultAdminMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "4f0710fcb3b3a60e5edbc238ffa3714d",
    "id": null,
    "metadata": {},
    "name": "documentsAddEventResultAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsAddEventResultAdminMutation(\n  $slug: String!\n  $eventId: ID!\n  $input: AddEventResultInput!\n) {\n  addEventResult(slug: $slug, eventId: $eventId, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "654b721df3a826b005727402695367ce";

export default node;
