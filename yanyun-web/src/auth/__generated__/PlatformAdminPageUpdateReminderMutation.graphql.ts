/**
 * @generated SignedSource<<9c98199f60beb6ad69961fce14c98693>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageUpdateReminderMutation$variables = {
  enabled?: boolean | null | undefined;
  slug: string;
  webhook?: string | null | undefined;
};
export type PlatformAdminPageUpdateReminderMutation$data = {
  readonly platformAdminUpdateReminder: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly message: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageUpdateReminderMutation = {
  response: PlatformAdminPageUpdateReminderMutation$data;
  variables: PlatformAdminPageUpdateReminderMutation$variables;
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
    "concreteType": "PlatformAdminReminderPayload",
    "kind": "LinkedField",
    "name": "platformAdminUpdateReminder",
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
    "name": "PlatformAdminPageUpdateReminderMutation",
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
    "name": "PlatformAdminPageUpdateReminderMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "db5114baac7ca824a447c84ceb40e43a",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageUpdateReminderMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageUpdateReminderMutation(\n  $slug: String!\n  $webhook: String\n  $enabled: Boolean\n) {\n  platformAdminUpdateReminder(slug: $slug, webhook: $webhook, enabled: $enabled) {\n    ok\n    error\n    errorCode\n    message\n  }\n}\n"
  }
};
})();

(node as any).hash = "fe314f4c7ad3a5761d3b7efce22e3eb0";

export default node;
