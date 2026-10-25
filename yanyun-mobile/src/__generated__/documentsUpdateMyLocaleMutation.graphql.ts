/**
 * @generated SignedSource<<e707111149b5b7b449c56c3d9dd207e7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUpdateMyLocaleMutation$variables = {
  locale?: string | null | undefined;
};
export type documentsUpdateMyLocaleMutation$data = {
  readonly updateMyLocale: {
    readonly effectiveLocale: string;
    readonly error: string | null | undefined;
    readonly localePref: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateMyLocaleMutation = {
  response: documentsUpdateMyLocaleMutation$data;
  variables: documentsUpdateMyLocaleMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "locale"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "locale",
        "variableName": "locale"
      }
    ],
    "concreteType": "UpdateLocalePayload",
    "kind": "LinkedField",
    "name": "updateMyLocale",
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
        "name": "localePref",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "effectiveLocale",
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
    "name": "documentsUpdateMyLocaleMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsUpdateMyLocaleMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "a0f2890f5dea3dd119f8ffda8a86afbe",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateMyLocaleMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateMyLocaleMutation(\n  $locale: String\n) {\n  updateMyLocale(locale: $locale) {\n    ok\n    error\n    localePref\n    effectiveLocale\n  }\n}\n"
  }
};
})();

(node as any).hash = "1521e8d8303e6fac4b10bae8fef180d4";

export default node;
