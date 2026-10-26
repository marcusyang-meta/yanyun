/**
 * @generated SignedSource<<306a0a08c5b90ea189c6b8e5c7b73ef9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type LeaveGroupingInput = {
  groupingId: string;
  uid: string;
};
export type documentsLeaveGroupingMutation$variables = {
  input: LeaveGroupingInput;
};
export type documentsLeaveGroupingMutation$data = {
  readonly leaveGrouping: {
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
export type documentsLeaveGroupingMutation = {
  response: documentsLeaveGroupingMutation$data;
  variables: documentsLeaveGroupingMutation$variables;
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
    "name": "leaveGrouping",
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
    "name": "documentsLeaveGroupingMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsLeaveGroupingMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "edc281aa6963aed9447d5b4c6cd28b42",
    "id": null,
    "metadata": {},
    "name": "documentsLeaveGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsLeaveGroupingMutation(\n  $input: LeaveGroupingInput!\n) {\n  leaveGrouping(input: $input) {\n    ok\n    error\n    seats {\n      index\n      nickname\n      weapon\n      role\n      uid\n      occupied\n      ready\n      mine\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a123abd556f3f8304359ba7ae32d41eb";

export default node;
