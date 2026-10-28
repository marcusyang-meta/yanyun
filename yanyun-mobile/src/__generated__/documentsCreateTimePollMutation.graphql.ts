/**
 * @generated SignedSource<<b2c734c517966a5fc7d18e66bbea0189>>
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
export type documentsCreateTimePollMutation$variables = {
  input: CreateTimePollInput;
};
export type documentsCreateTimePollMutation$data = {
  readonly createTimePoll: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly poll: {
      readonly id: string;
    } | null | undefined;
  };
};
export type documentsCreateTimePollMutation = {
  response: documentsCreateTimePollMutation$data;
  variables: documentsCreateTimePollMutation$variables;
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
    "name": "documentsCreateTimePollMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsCreateTimePollMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "900a456e708cb04e861d3124755abef3",
    "id": null,
    "metadata": {},
    "name": "documentsCreateTimePollMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCreateTimePollMutation(\n  $input: CreateTimePollInput!\n) {\n  createTimePoll(input: $input) {\n    ok\n    error\n    errorCode\n    poll {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d24aa1ec20df615582896fc293ff2138";

export default node;
