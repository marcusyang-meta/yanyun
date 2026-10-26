/**
 * @generated SignedSource<<6d437aa7161411ca4d88923b5bc6e0ce>>
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
export type documentsCreateGuildMutation$variables = {
  input: CreateGuildInput;
};
export type documentsCreateGuildMutation$data = {
  readonly createGuild: {
    readonly error: string | null | undefined;
    readonly guild: {
      readonly name: string | null | undefined;
      readonly slug: string;
    } | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsCreateGuildMutation = {
  response: documentsCreateGuildMutation$data;
  variables: documentsCreateGuildMutation$variables;
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
    "name": "documentsCreateGuildMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsCreateGuildMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "3d0058fd8c06f45c66aa8edf1a3639c3",
    "id": null,
    "metadata": {},
    "name": "documentsCreateGuildMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCreateGuildMutation(\n  $input: CreateGuildInput!\n) {\n  createGuild(input: $input) {\n    ok\n    error\n    guild {\n      slug\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7aac493cee8e63286cb12d804071fba3";

export default node;
