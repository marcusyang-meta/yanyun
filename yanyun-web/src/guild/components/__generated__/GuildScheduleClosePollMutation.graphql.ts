/**
 * @generated SignedSource<<4dbc2b1f8c9ce8f5bf1cc71ddb33485b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildScheduleClosePollMutation$variables = {
  id: string;
};
export type GuildScheduleClosePollMutation$data = {
  readonly closeTimePoll: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly poll: {
      readonly id: string;
      readonly status: string;
    } | null | undefined;
  };
};
export type GuildScheduleClosePollMutation = {
  response: GuildScheduleClosePollMutation$data;
  variables: GuildScheduleClosePollMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "TimePollPayload",
    "kind": "LinkedField",
    "name": "closeTimePoll",
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
        "name": "errorCode",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "TimePoll",
        "kind": "LinkedField",
        "name": "poll",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildScheduleClosePollMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildScheduleClosePollMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "eadf4c97f1708dd8de8d1fc16c74f562",
    "id": null,
    "metadata": {},
    "name": "GuildScheduleClosePollMutation",
    "operationKind": "mutation",
    "text": "mutation GuildScheduleClosePollMutation(\n  $id: ID!\n) {\n  closeTimePoll(id: $id) {\n    ok\n    error\n    errorCode\n    poll {\n      id\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4c15e7268f1d40f533c72b873ed8a70f";

export default node;
