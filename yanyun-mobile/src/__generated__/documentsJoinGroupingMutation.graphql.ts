/**
 * @generated SignedSource<<9f2e81ea08f607e89c6a9a05a8ad3eb6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type JoinGroupingInput = {
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
      readonly nickname: string | null | undefined;
      readonly occupied: boolean;
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
    "cacheID": "1c08516419f9f922020ead9b1a2c4ee2",
    "id": null,
    "metadata": {},
    "name": "documentsJoinGroupingMutation",
    "operationKind": "mutation",
    "text": "mutation documentsJoinGroupingMutation(\n  $input: JoinGroupingInput!\n) {\n  joinGrouping(input: $input) {\n    ok\n    error\n    seats {\n      index\n      nickname\n      weapon\n      role\n      uid\n      occupied\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1f871bef89bd599f478d6c77a09a7d22";

export default node;
