/**
 * @generated SignedSource<<b8ca33eb3d46211f9960179168620f5f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOpsSendMutation$variables = {
  eventId: string;
  segmentKind: string;
  segmentValue?: string | null | undefined;
  slug: string;
};
export type GuildAdminOpsSendMutation$data = {
  readonly sendTargetedNudge: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly recipientCount: number | null | undefined;
  };
};
export type GuildAdminOpsSendMutation = {
  response: GuildAdminOpsSendMutation$data;
  variables: GuildAdminOpsSendMutation$variables;
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
  "name": "segmentKind"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "segmentValue"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v4 = [
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
        "name": "segmentKind",
        "variableName": "segmentKind"
      },
      {
        "kind": "Variable",
        "name": "segmentValue",
        "variableName": "segmentValue"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "OpsPayload",
    "kind": "LinkedField",
    "name": "sendTargetedNudge",
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
        "name": "recipientCount",
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
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminOpsSendMutation",
    "selections": (v4/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminOpsSendMutation",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "e58102d979af20acf509e7bc56d4e93b",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOpsSendMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminOpsSendMutation(\n  $slug: String!\n  $eventId: ID!\n  $segmentKind: String!\n  $segmentValue: String\n) {\n  sendTargetedNudge(slug: $slug, eventId: $eventId, segmentKind: $segmentKind, segmentValue: $segmentValue) {\n    ok\n    error\n    recipientCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "a5abf93627d661dfc8ded7ae4e3e1c10";

export default node;
