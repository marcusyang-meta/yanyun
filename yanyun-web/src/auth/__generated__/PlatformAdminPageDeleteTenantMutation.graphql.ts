/**
 * @generated SignedSource<<886ad8796910f80a7fea7297f70b9da6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageDeleteTenantMutation$variables = {
  slug: string;
};
export type PlatformAdminPageDeleteTenantMutation$data = {
  readonly platformAdminDeleteTenant: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageDeleteTenantMutation = {
  response: PlatformAdminPageDeleteTenantMutation$data;
  variables: PlatformAdminPageDeleteTenantMutation$variables;
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
    "concreteType": "PlatformAdminPayload",
    "kind": "LinkedField",
    "name": "platformAdminDeleteTenant",
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
    "name": "PlatformAdminPageDeleteTenantMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageDeleteTenantMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "3200535799ca07f4a29545742d6bd787",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageDeleteTenantMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageDeleteTenantMutation(\n  $slug: String!\n) {\n  platformAdminDeleteTenant(slug: $slug) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "d8482ffb9beb9bfb5e2b7a5bf495057b";

export default node;
