/**
 * @generated SignedSource<<f4ac68d8d90ad28b81e2260730c81f7a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageMigrateBossGuidesMutation$variables = Record<PropertyKey, never>;
export type PlatformAdminPageMigrateBossGuidesMutation$data = {
  readonly platformAdminMigrateBossGuides: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageMigrateBossGuidesMutation = {
  response: PlatformAdminPageMigrateBossGuidesMutation$data;
  variables: PlatformAdminPageMigrateBossGuidesMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PlatformGuideMigrationPayload",
    "kind": "LinkedField",
    "name": "platformAdminMigrateBossGuides",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageMigrateBossGuidesMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PlatformAdminPageMigrateBossGuidesMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "0093048823eb3c0880c25f0b78eb3ce7",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageMigrateBossGuidesMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageMigrateBossGuidesMutation {\n  platformAdminMigrateBossGuides {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "21c34462761fe9cbc467d639cbdb4ee5";

export default node;
