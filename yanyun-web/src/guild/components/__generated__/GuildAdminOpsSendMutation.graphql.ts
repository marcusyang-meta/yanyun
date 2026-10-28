/**
 * @generated SignedSource<<8af0a3bab0d885013a7ad1f3d5733876>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOpsSendMutation$variables = {
  eventId: number;
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
    "cacheID": "1bf08dfa53235fcef7c7cc1dd39f06a5",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOpsSendMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminOpsSendMutation(\n  $slug: String!\n  $eventId: Int!\n  $segmentKind: String!\n  $segmentValue: String\n) {\n  sendTargetedNudge(slug: $slug, eventId: $eventId, segmentKind: $segmentKind, segmentValue: $segmentValue) {\n    ok\n    error\n    recipientCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "49be7f94ae73a51434b793b594535d22";

export default node;
