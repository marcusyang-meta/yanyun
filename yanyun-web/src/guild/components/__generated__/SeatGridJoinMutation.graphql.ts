/**
 * @generated SignedSource<<db939b6165216d58956a20ccd1decc33>>
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
export type SeatGridJoinMutation$variables = {
  input: JoinGroupingInput;
};
export type SeatGridJoinMutation$data = {
  readonly joinGrouping: {
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
    "cacheID": "92e5f06162aac398c2881eefdb2bae88",
    "id": null,
    "metadata": {},
    "name": "SeatGridJoinMutation",
    "operationKind": "mutation",
    "text": "mutation SeatGridJoinMutation(\n  $input: JoinGroupingInput!\n) {\n  joinGrouping(input: $input) {\n    ok\n    error\n    seats {\n      index\n      nickname\n      weapon\n      role\n      uid\n      occupied\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "48440e8f0c661e0a0d81cb74c2a2e19c";

export default node;
