/**
 * @generated SignedSource<<605109d967afa17be9a96e8baaba3f6f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateGuildInput = {
  discordGuildId: string;
  name: string;
  slug: string;
};
export type CreateGuildMutation$variables = {
  input: CreateGuildInput;
};
export type CreateGuildMutation$data = {
  readonly createGuild: {
    readonly error: string | null | undefined;
    readonly guild: {
      readonly name: string | null | undefined;
      readonly slug: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type CreateGuildMutation = {
  response: CreateGuildMutation$data;
  variables: CreateGuildMutation$variables;
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
    "concreteType": "CreateGuildPayload",
    "kind": "LinkedField",
    "name": "createGuild",
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
        "concreteType": "Guild",
        "kind": "LinkedField",
        "name": "guild",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slug",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
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
    "name": "CreateGuildMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "CreateGuildMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "fc12393744fae17fe1a4bef80a40da0c",
    "id": null,
    "metadata": {},
    "name": "CreateGuildMutation",
    "operationKind": "mutation",
    "text": "mutation CreateGuildMutation(\n  $input: CreateGuildInput!\n) {\n  createGuild(input: $input) {\n    ok\n    error\n    guild {\n      slug\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f31ff1a34bfeb0ef60e822a9e65df58f";

export default node;
