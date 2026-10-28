/**
 * @generated SignedSource<<c5033f00aabec40ff0e32760ee6bcb0d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageCreateBossMutation$variables = {
  name: string;
  note?: string | null | undefined;
  sortOrder?: number | null | undefined;
  source?: string | null | undefined;
  talent?: string | null | undefined;
};
export type PlatformAdminPageCreateBossMutation$data = {
  readonly platformAdminCreateBoss: {
    readonly bossId: number | null | undefined;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageCreateBossMutation = {
  response: PlatformAdminPageCreateBossMutation$data;
  variables: PlatformAdminPageCreateBossMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "note"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "sortOrder"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "source"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "talent"
},
v5 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      },
      {
        "kind": "Variable",
        "name": "note",
        "variableName": "note"
      },
      {
        "kind": "Variable",
        "name": "sortOrder",
        "variableName": "sortOrder"
      },
      {
        "kind": "Variable",
        "name": "source",
        "variableName": "source"
      },
      {
        "kind": "Variable",
        "name": "talent",
        "variableName": "talent"
      }
    ],
    "concreteType": "PlatformAdminBossPayload",
    "kind": "LinkedField",
    "name": "platformAdminCreateBoss",
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
        "name": "bossId",
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
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageCreateBossMutation",
    "selections": (v5/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v4/*:: as any*/),
      (v3/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "PlatformAdminPageCreateBossMutation",
    "selections": (v5/*:: as any*/)
  },
  "params": {
    "cacheID": "631d3d21a287852be2b19ac490ce1571",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageCreateBossMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageCreateBossMutation(\n  $name: String!\n  $talent: String\n  $source: String\n  $note: String\n  $sortOrder: Int\n) {\n  platformAdminCreateBoss(name: $name, talent: $talent, source: $source, note: $note, sortOrder: $sortOrder) {\n    ok\n    error\n    errorCode\n    bossId\n  }\n}\n"
  }
};
})();

(node as any).hash = "25c41738d3a7d48566001f5da94f2b97";

export default node;
