/**
 * @generated SignedSource<<b8579fcab3673e8db4533dade0857729>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageSetPaygateMutation$variables = {
  enabled: boolean;
};
export type PlatformAdminPageSetPaygateMutation$data = {
  readonly platformAdminSetPaygate: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageSetPaygateMutation = {
  response: PlatformAdminPageSetPaygateMutation$data;
  variables: PlatformAdminPageSetPaygateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "enabled"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "enabled",
        "variableName": "enabled"
      }
    ],
    "concreteType": "PlatformAdminBillingPayload",
    "kind": "LinkedField",
    "name": "platformAdminSetPaygate",
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
    "name": "PlatformAdminPageSetPaygateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageSetPaygateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "7cee9f36f2957df4d342a797a63e8915",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageSetPaygateMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageSetPaygateMutation(\n  $enabled: Boolean!\n) {\n  platformAdminSetPaygate(enabled: $enabled) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "4fa66d58d6e2c9c5c31eb3c3eed3cd65";

export default node;
