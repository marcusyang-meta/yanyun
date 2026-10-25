/**
 * @generated SignedSource<<9534ccbdba0e83a4910e1a0940c66ebc>>
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
export type SeatGridLeaveMutation$variables = {
  input: LeaveGroupingInput;
};
export type SeatGridLeaveMutation$data = {
  readonly leaveGrouping: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly seats: ReadonlyArray<{
      readonly index: number;
      readonly nickname: string | null | undefined;
      readonly occupied: boolean;
      readonly role: string | null | undefined;
      readonly uid: string | null | undefined;
      readonly weapon: string | null | undefined;
    }> | null | undefined;
  };
};
export type SeatGridLeaveMutation = {
  response: SeatGridLeaveMutation$data;
  variables: SeatGridLeaveMutation$variables;
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
    "name": "SeatGridLeaveMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SeatGridLeaveMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "83ca874114ed388a5d9d5b0d97968ec7",
    "id": null,
    "metadata": {},
    "name": "SeatGridLeaveMutation",
    "operationKind": "mutation",
    "text": "mutation SeatGridLeaveMutation(\n  $input: LeaveGroupingInput!\n) {\n  leaveGrouping(input: $input) {\n    ok\n    error\n    seats {\n      index\n      nickname\n      weapon\n      role\n      uid\n      occupied\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "82fe4f12153108fd5b48e18651b445df";

export default node;
