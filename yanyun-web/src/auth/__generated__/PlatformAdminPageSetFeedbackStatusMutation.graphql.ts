/**
 * @generated SignedSource<<c1b0a2eb9603a7be0cd9a06683eacc28>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageSetFeedbackStatusMutation$variables = {
  id: string;
  status: string;
};
export type PlatformAdminPageSetFeedbackStatusMutation$data = {
  readonly platformAdminSetFeedbackStatus: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageSetFeedbackStatusMutation = {
  response: PlatformAdminPageSetFeedbackStatusMutation$data;
  variables: PlatformAdminPageSetFeedbackStatusMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "status"
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
      },
      {
        "kind": "Variable",
        "name": "status",
        "variableName": "status"
      }
    ],
    "concreteType": "PlatformAdminPayload",
    "kind": "LinkedField",
    "name": "platformAdminSetFeedbackStatus",
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
    "name": "PlatformAdminPageSetFeedbackStatusMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageSetFeedbackStatusMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "1b70e1e20e426ea610880130f8980c37",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageSetFeedbackStatusMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageSetFeedbackStatusMutation(\n  $id: ID!\n  $status: String!\n) {\n  platformAdminSetFeedbackStatus(id: $id, status: $status) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "5c40e0b3006fc4cd3675322f6f32853a";

export default node;
