/**
 * @generated SignedSource<<afe8efacdfa3d3c1e06422642b1848e8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsRegisterPushTokenMutation$variables = {
  platform?: string | null | undefined;
  token: string;
};
export type documentsRegisterPushTokenMutation$data = {
  readonly registerPushToken: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsRegisterPushTokenMutation = {
  response: documentsRegisterPushTokenMutation$data;
  variables: documentsRegisterPushTokenMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "platform"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "token"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "platform",
        "variableName": "platform"
      },
      {
        "kind": "Variable",
        "name": "token",
        "variableName": "token"
      }
    ],
    "concreteType": "PushTokenPayload",
    "kind": "LinkedField",
    "name": "registerPushToken",
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
    "name": "documentsRegisterPushTokenMutation",
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
    "name": "documentsRegisterPushTokenMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "0c53e5295cc90aa62a9d2ae381504c94",
    "id": null,
    "metadata": {},
    "name": "documentsRegisterPushTokenMutation",
    "operationKind": "mutation",
    "text": "mutation documentsRegisterPushTokenMutation(\n  $token: String!\n  $platform: String\n) {\n  registerPushToken(token: $token, platform: $platform) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "ed83cb5bb5dafc9dad5dd927e81a081c";

export default node;
