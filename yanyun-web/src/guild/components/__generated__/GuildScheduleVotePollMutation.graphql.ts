/**
 * @generated SignedSource<<b583f4c75846d381bcf1eac9ce1ae376>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VoteTimePollInput = {
  optionIds: ReadonlyArray<string>;
  pollId: string;
};
export type GuildScheduleVotePollMutation$variables = {
  input: VoteTimePollInput;
};
export type GuildScheduleVotePollMutation$data = {
  readonly voteTimePoll: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly poll: {
      readonly id: string;
      readonly myOptionIds: ReadonlyArray<string>;
      readonly options: ReadonlyArray<{
        readonly id: string;
        readonly voteCount: number;
        readonly votedByMe: boolean;
        readonly voterNames: ReadonlyArray<string>;
      }>;
    } | null | undefined;
  };
};
export type GuildScheduleVotePollMutation = {
  response: GuildScheduleVotePollMutation$data;
  variables: GuildScheduleVotePollMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "TimePollPayload",
    "kind": "LinkedField",
    "name": "voteTimePoll",
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
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "myOptionIds",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "TimePollOption",
            "kind": "LinkedField",
            "name": "options",
            "plural": true,
            "selections": [
              (v1/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "voteCount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "voterNames",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "votedByMe",
                "storageKey": null
              }
            ],
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
    "name": "GuildScheduleVotePollMutation",
    "selections": (v2/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildScheduleVotePollMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "85c1cfd26d5b9b62dddbbf147f85c6e2",
    "id": null,
    "metadata": {},
    "name": "GuildScheduleVotePollMutation",
    "operationKind": "mutation",
    "text": "mutation GuildScheduleVotePollMutation(\n  $input: VoteTimePollInput!\n) {\n  voteTimePoll(input: $input) {\n    ok\n    error\n    errorCode\n    poll {\n      id\n      myOptionIds\n      options {\n        id\n        voteCount\n        voterNames\n        votedByMe\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b51d5b7adb3e5d96d7ba26030e2b07a4";

export default node;
