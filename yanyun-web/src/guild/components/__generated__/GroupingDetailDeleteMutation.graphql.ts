/**
 * @generated SignedSource<<3085833aa53890164579aa7fd4036dfb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingDetailDeleteMutation$variables = {
  id: string;
};
export type GroupingDetailDeleteMutation$data = {
  readonly disbandGrouping: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GroupingDetailDeleteMutation = {
  response: GroupingDetailDeleteMutation$data;
  variables: GroupingDetailDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "DeletePayload",
    "kind": "LinkedField",
    "name": "disbandGrouping",
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GroupingDetailDeleteMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingDetailDeleteMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "89ebf27cbad23f7751ba3201cfba6319",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailDeleteMutation(\n  $id: ID!\n) {\n  disbandGrouping(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "c95d82651b486dc1bbe8b174367a3c7d";

export default node;
