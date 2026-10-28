/**
 * @generated SignedSource<<4624b5908520f334e0df1ffceddd7edd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageTestHeirloomMutation$variables = {
  slug: string;
};
export type PlatformAdminPageTestHeirloomMutation$data = {
  readonly platformAdminTestHeirloom: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly message: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageTestHeirloomMutation = {
  response: PlatformAdminPageTestHeirloomMutation$data;
  variables: PlatformAdminPageTestHeirloomMutation$variables;
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
    "concreteType": "PlatformAdminHeirloomPayload",
    "kind": "LinkedField",
    "name": "platformAdminTestHeirloom",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "message",
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
    "name": "PlatformAdminPageTestHeirloomMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageTestHeirloomMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "eeb2a2007819dd7c3a552a9bc61fabfc",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageTestHeirloomMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageTestHeirloomMutation(\n  $slug: String!\n) {\n  platformAdminTestHeirloom(slug: $slug) {\n    ok\n    error\n    errorCode\n    message\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4295cdfdd6b2d73caedf4c1de37d024";

export default node;
