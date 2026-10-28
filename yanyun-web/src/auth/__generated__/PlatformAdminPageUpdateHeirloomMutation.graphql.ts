/**
 * @generated SignedSource<<63dae8ddd86cbacd18979b5fb87f618e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageUpdateHeirloomMutation$variables = {
  enabled?: boolean | null | undefined;
  slug: string;
  webhook?: string | null | undefined;
};
export type PlatformAdminPageUpdateHeirloomMutation$data = {
  readonly platformAdminUpdateHeirloom: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly message: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageUpdateHeirloomMutation = {
  response: PlatformAdminPageUpdateHeirloomMutation$data;
  variables: PlatformAdminPageUpdateHeirloomMutation$variables;
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
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "webhook"
},
v3 = [
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
      },
      {
        "kind": "Variable",
        "name": "webhook",
        "variableName": "webhook"
      }
    ],
    "concreteType": "PlatformAdminHeirloomPayload",
    "kind": "LinkedField",
    "name": "platformAdminUpdateHeirloom",
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
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageUpdateHeirloomMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "PlatformAdminPageUpdateHeirloomMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "ef53cb64c5e48d5e16a80288f1c3afa9",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageUpdateHeirloomMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageUpdateHeirloomMutation(\n  $slug: String!\n  $webhook: String\n  $enabled: Boolean\n) {\n  platformAdminUpdateHeirloom(slug: $slug, webhook: $webhook, enabled: $enabled) {\n    ok\n    error\n    errorCode\n    message\n  }\n}\n"
  }
};
})();

(node as any).hash = "f43bae4be81d85ca881f870dfa0963ad";

export default node;
