/**
 * @generated SignedSource<<e62f336153112e63229cef451648be05>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateTimePollInput = {
  candidateStartsAt: ReadonlyArray<string>;
  slug: string;
  title: string;
};
export type GuildScheduleCreatePollMutation$variables = {
  input: CreateTimePollInput;
};
export type GuildScheduleCreatePollMutation$data = {
  readonly createTimePoll: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly poll: {
      readonly id: string;
    } | null | undefined;
  };
};
export type GuildScheduleCreatePollMutation = {
  response: GuildScheduleCreatePollMutation$data;
  variables: GuildScheduleCreatePollMutation$variables;
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
    "concreteType": "TimePollPayload",
    "kind": "LinkedField",
    "name": "createTimePoll",
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
    "name": "GuildScheduleCreatePollMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildScheduleCreatePollMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "50cafcfaadc714984594451143f233a7",
    "id": null,
    "metadata": {},
    "name": "GuildScheduleCreatePollMutation",
    "operationKind": "mutation",
    "text": "mutation GuildScheduleCreatePollMutation(\n  $input: CreateTimePollInput!\n) {\n  createTimePoll(input: $input) {\n    ok\n    error\n    errorCode\n    poll {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "639b9e644775e671a4691bde703c6802";

export default node;
