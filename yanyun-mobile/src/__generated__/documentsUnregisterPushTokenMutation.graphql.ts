/**
 * @generated SignedSource<<aa618afc92a2616541042b8a6179ac3a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUnregisterPushTokenMutation$variables = {
  token: string;
};
export type documentsUnregisterPushTokenMutation$data = {
  readonly unregisterPushToken: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUnregisterPushTokenMutation = {
  response: documentsUnregisterPushTokenMutation$data;
  variables: documentsUnregisterPushTokenMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "token"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "token",
        "variableName": "token"
      }
    ],
    "concreteType": "PushTokenPayload",
    "kind": "LinkedField",
    "name": "unregisterPushToken",
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
    "name": "documentsUnregisterPushTokenMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsUnregisterPushTokenMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "b0d26f7bc8216be77559c0d2621b4e1c",
    "id": null,
    "metadata": {},
    "name": "documentsUnregisterPushTokenMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUnregisterPushTokenMutation(\n  $token: String!\n) {\n  unregisterPushToken(token: $token) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "cb17baf1fd896fe23751478dc60d872d";

export default node;
