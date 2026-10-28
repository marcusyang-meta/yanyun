/**
 * @generated SignedSource<<ff20038601e7823c05894c06f62b5157>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsApplyToGuildMutation$variables = {
  message?: string | null | undefined;
  slug: string;
};
export type documentsApplyToGuildMutation$data = {
  readonly applyToGuild: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsApplyToGuildMutation = {
  response: documentsApplyToGuildMutation$data;
  variables: documentsApplyToGuildMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "message"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "message",
        "variableName": "message"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "RecruitPayload",
    "kind": "LinkedField",
    "name": "applyToGuild",
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsApplyToGuildMutation",
    "selections": (v2/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsApplyToGuildMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "2fff7372f56bb3eb65e51e4c06ae82cd",
    "id": null,
    "metadata": {},
    "name": "documentsApplyToGuildMutation",
    "operationKind": "mutation",
    "text": "mutation documentsApplyToGuildMutation(\n  $slug: String!\n  $message: String\n) {\n  applyToGuild(slug: $slug, message: $message) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "b255ff031a751a6227b1e6aa9a61a573";

export default node;
