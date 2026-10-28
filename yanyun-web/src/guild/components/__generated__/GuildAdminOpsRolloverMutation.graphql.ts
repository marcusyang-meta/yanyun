/**
 * @generated SignedSource<<885871b653014d049f9bc1ee457c22ac>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOpsRolloverMutation$variables = {
  slug: string;
};
export type GuildAdminOpsRolloverMutation$data = {
  readonly executeSeasonRollover: {
    readonly copiedCount: number | null | undefined;
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminOpsRolloverMutation = {
  response: GuildAdminOpsRolloverMutation$data;
  variables: GuildAdminOpsRolloverMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "OpsPayload",
    "kind": "LinkedField",
    "name": "executeSeasonRollover",
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
        "name": "copiedCount",
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
    "name": "GuildAdminOpsRolloverMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildAdminOpsRolloverMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "e5387c939789990c8fc9fa35e475e55a",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOpsRolloverMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminOpsRolloverMutation(\n  $slug: String!\n) {\n  executeSeasonRollover(slug: $slug) {\n    ok\n    error\n    copiedCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "a59fe4a1f0fe157cefb835d1bd41a233";

export default node;
