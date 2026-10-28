/**
 * @generated SignedSource<<a2191f94a94ad5eff45f83c446792e41>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageRevokeMutation$variables = {
  slug: string;
};
export type PlatformAdminPageRevokeMutation$data = {
  readonly platformAdminRevokePremium: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageRevokeMutation = {
  response: PlatformAdminPageRevokeMutation$data;
  variables: PlatformAdminPageRevokeMutation$variables;
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
    "concreteType": "PlatformAdminBillingPayload",
    "kind": "LinkedField",
    "name": "platformAdminRevokePremium",
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
    "name": "PlatformAdminPageRevokeMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageRevokeMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "6317cbd5aaa7af3b233aca0e31835045",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageRevokeMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageRevokeMutation(\n  $slug: String!\n) {\n  platformAdminRevokePremium(slug: $slug) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "2c7c603ee07d7700f22355ef1825d8d2";

export default node;
