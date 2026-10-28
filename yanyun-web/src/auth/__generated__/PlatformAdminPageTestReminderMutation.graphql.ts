/**
 * @generated SignedSource<<307305b7329d85a88b82c26dc5fb82d0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageTestReminderMutation$variables = {
  slug: string;
};
export type PlatformAdminPageTestReminderMutation$data = {
  readonly platformAdminTestReminder: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly message: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageTestReminderMutation = {
  response: PlatformAdminPageTestReminderMutation$data;
  variables: PlatformAdminPageTestReminderMutation$variables;
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
    "concreteType": "PlatformAdminReminderPayload",
    "kind": "LinkedField",
    "name": "platformAdminTestReminder",
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
    "name": "PlatformAdminPageTestReminderMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageTestReminderMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "fd71285af0228e64f0b741de71bdca66",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageTestReminderMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageTestReminderMutation(\n  $slug: String!\n) {\n  platformAdminTestReminder(slug: $slug) {\n    ok\n    error\n    errorCode\n    message\n  }\n}\n"
  }
};
})();

(node as any).hash = "caebb1a96d8f5c0140988d1394f526a7";

export default node;
