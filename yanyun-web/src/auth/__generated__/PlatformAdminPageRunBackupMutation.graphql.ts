/**
 * @generated SignedSource<<bb157b0346f4e1fa1ac6bdfeb150f6f3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageRunBackupMutation$variables = Record<PropertyKey, never>;
export type PlatformAdminPageRunBackupMutation$data = {
  readonly platformAdminRunBackup: {
    readonly bytes: number | null | undefined;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly key: string | null | undefined;
    readonly ok: boolean;
    readonly rows: number | null | undefined;
  };
};
export type PlatformAdminPageRunBackupMutation = {
  response: PlatformAdminPageRunBackupMutation$data;
  variables: PlatformAdminPageRunBackupMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PlatformAdminBackupRunPayload",
    "kind": "LinkedField",
    "name": "platformAdminRunBackup",
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
        "name": "key",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "rows",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "bytes",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageRunBackupMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PlatformAdminPageRunBackupMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "c4cdbba94a003d02d98aa81a2b17bd60",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageRunBackupMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageRunBackupMutation {\n  platformAdminRunBackup {\n    ok\n    error\n    errorCode\n    key\n    rows\n    bytes\n  }\n}\n"
  }
};
})();

(node as any).hash = "16bf5e5ed3a18f521020e6540f7e7342";

export default node;
