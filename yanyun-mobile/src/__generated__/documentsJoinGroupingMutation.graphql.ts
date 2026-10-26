/**
 * @generated SignedSource<<41ac27cee2d4cf35cbc5bf2f0281e96b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type JoinGroupingInput = {
  forDiscordId?: string | null | undefined;
  groupingId: string;
  nickname: string;
  seatIndex: number;
  weapon: string;
};
export type documentsJoinGroupingMutation$variables = {
  input: JoinGroupingInput;
};
export type documentsJoinGroupingMutation$data = {
  readonly joinGrouping: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly seats: ReadonlyArray<{
      readonly index: number;
      readonly mine: boolean;
      readonly nickname: string | null | undefined;
      readonly occupied: boolean;
      readonly ready: boolean;
      readonly role: string | null | undefined;
      readonly uid: string | null | undefined;
      readonly weapon: string | null | undefined;
    }> | null | undefined;
  };
};
export type documentsJoinGroupingMutation = {
  response: documentsJoinGroupingMutation$data;
  variables: documentsJoinGroupingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "SeatPayload",
    "kind": "LinkedField",
    "name": "joinGrouping",
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
        "concreteType": "Seat",
        "kind": "LinkedField",
        "name": "seats",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "index",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "nickname",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "weapon",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "role",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "uid",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "occupied",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ready",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "mine",
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
    "name": "documentsJoinGroupingMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsJoinGroupingMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "3ddfcf38ba67f96b90ee80a491a601ce",
    "id": null,
    "metadata": {},
    "name": "documentsJoinGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsJoinGroupingMutation(\n  $input: JoinGroupingInput!\n) {\n  joinGrouping(input: $input) {\n    ok\n    error\n    seats {\n      index\n      nickname\n      weapon\n      role\n      uid\n      occupied\n      ready\n      mine\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b77160c43f1b1a8bcc66e7d53f10fddd";

export default node;
