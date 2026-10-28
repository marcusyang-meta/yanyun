/**
 * @generated SignedSource<<9060eab022f063f29bc3ce6dee68c01c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageUpdateSettingsMutation$variables = {
  gameNotice?: string | null | undefined;
  gameVersion?: string | null | undefined;
  gameVersionCode?: string | null | undefined;
};
export type PlatformAdminPageUpdateSettingsMutation$data = {
  readonly platformAdminUpdateSettings: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageUpdateSettingsMutation = {
  response: PlatformAdminPageUpdateSettingsMutation$data;
  variables: PlatformAdminPageUpdateSettingsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gameNotice"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gameVersion"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gameVersionCode"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "gameNotice",
        "variableName": "gameNotice"
      },
      {
        "kind": "Variable",
        "name": "gameVersion",
        "variableName": "gameVersion"
      },
      {
        "kind": "Variable",
        "name": "gameVersionCode",
        "variableName": "gameVersionCode"
      }
    ],
    "concreteType": "PlatformAdminPayload",
    "kind": "LinkedField",
    "name": "platformAdminUpdateSettings",
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
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageUpdateSettingsMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "PlatformAdminPageUpdateSettingsMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "edb9f43b7853d2187df0feb6139819b7",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageUpdateSettingsMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageUpdateSettingsMutation(\n  $gameVersion: String\n  $gameNotice: String\n  $gameVersionCode: String\n) {\n  platformAdminUpdateSettings(gameVersion: $gameVersion, gameNotice: $gameNotice, gameVersionCode: $gameVersionCode) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "599437d2269a7288f0c5948bb7153bcb";

export default node;
