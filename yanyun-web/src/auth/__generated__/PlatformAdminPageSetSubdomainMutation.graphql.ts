/**
 * @generated SignedSource<<48ac5d0a3b617212c7f2a4e09dc6345f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageSetSubdomainMutation$variables = {
  enabled: boolean;
  slug: string;
};
export type PlatformAdminPageSetSubdomainMutation$data = {
  readonly platformAdminSetSubdomain: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageSetSubdomainMutation = {
  response: PlatformAdminPageSetSubdomainMutation$data;
  variables: PlatformAdminPageSetSubdomainMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enabled"
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
        "name": "enabled",
        "variableName": "enabled"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "PlatformAdminBillingPayload",
    "kind": "LinkedField",
    "name": "platformAdminSetSubdomain",
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
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageSetSubdomainMutation",
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
    "name": "PlatformAdminPageSetSubdomainMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "220a6c272f19d6414e889ee2816b5f8b",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageSetSubdomainMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageSetSubdomainMutation(\n  $slug: String!\n  $enabled: Boolean!\n) {\n  platformAdminSetSubdomain(slug: $slug, enabled: $enabled) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "e3dcfb83519c2719d8d704169f229d95";

export default node;
