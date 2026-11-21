/**
 * @generated SignedSource<<a0fb09a4972d4e83158310ecde30d4c5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type JoinGroupingInput = {
  answers?: ReadonlyArray<SignupAnswerInput> | null | undefined;
  confirmWeekDuplicate?: boolean | null | undefined;
  forDiscordId?: string | null | undefined;
  groupingId: string;
  nickname: string;
  seatIndex: number;
  weapon: string;
};
export type SignupAnswerInput = {
  fieldId: string;
  value: string;
};
export type SeatGridJoinMutation$variables = {
  input: JoinGroupingInput;
};
export type SeatGridJoinMutation$data = {
  readonly joinGrouping: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
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
export type SeatGridJoinMutation = {
  response: SeatGridJoinMutation$data;
  variables: SeatGridJoinMutation$variables;
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
        "kind": "ScalarField",
        "name": "errorCode",
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
    "name": "SeatGridJoinMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SeatGridJoinMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "cb772ef8d4db6d395cde6cd7ec9c890c",
    "id": null,
    "metadata": {},
    "name": "SeatGridJoinMutation",
    "operationKind": "mutation",
    "text": "mutation SeatGridJoinMutation(\n  $input: JoinGroupingInput!\n) {\n  joinGrouping(input: $input) {\n    ok\n    error\n    errorCode\n    seats {\n      index\n      nickname\n      weapon\n      role\n      uid\n      occupied\n      ready\n      mine\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b26c76f911951247427ae84f1d765ff7";

export default node;
