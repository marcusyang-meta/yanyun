/**
 * @generated SignedSource<<7f9f0d0f6032cf2c6965f060672d8e09>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageUpdateBossMutation$variables = {
  guide?: string | null | undefined;
  id: number;
  mechanicsJson?: string | null | undefined;
  name?: string | null | undefined;
  note?: string | null | undefined;
  shoutsJson?: string | null | undefined;
  sortOrder?: number | null | undefined;
  source?: string | null | undefined;
  talent?: string | null | undefined;
  talentsJson?: string | null | undefined;
};
export type PlatformAdminPageUpdateBossMutation$data = {
  readonly platformAdminUpdateBoss: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageUpdateBossMutation = {
  response: PlatformAdminPageUpdateBossMutation$data;
  variables: PlatformAdminPageUpdateBossMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "guide"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mechanicsJson"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "note"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "shoutsJson"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "sortOrder"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "source"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "talent"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "talentsJson"
},
v10 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "guide",
        "variableName": "guide"
      },
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "mechanicsJson",
        "variableName": "mechanicsJson"
      },
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
        "name": "shoutsJson",
        "variableName": "shoutsJson"
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
      },
      {
        "kind": "Variable",
        "name": "talentsJson",
        "variableName": "talentsJson"
      }
    ],
    "concreteType": "PlatformAdminPayload",
    "kind": "LinkedField",
    "name": "platformAdminUpdateBoss",
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
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/),
      (v6/*:: as any*/),
      (v7/*:: as any*/),
      (v8/*:: as any*/),
      (v9/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageUpdateBossMutation",
    "selections": (v10/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v3/*:: as any*/),
      (v8/*:: as any*/),
      (v7/*:: as any*/),
      (v4/*:: as any*/),
      (v6/*:: as any*/),
      (v0/*:: as any*/),
      (v2/*:: as any*/),
      (v9/*:: as any*/),
      (v5/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "PlatformAdminPageUpdateBossMutation",
    "selections": (v10/*:: as any*/)
  },
  "params": {
    "cacheID": "c3d33ac4a5d0ffac1f63138cf6e5346c",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageUpdateBossMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageUpdateBossMutation(\n  $id: Int!\n  $name: String\n  $talent: String\n  $source: String\n  $note: String\n  $sortOrder: Int\n  $guide: String\n  $mechanicsJson: String\n  $talentsJson: String\n  $shoutsJson: String\n) {\n  platformAdminUpdateBoss(id: $id, name: $name, talent: $talent, source: $source, note: $note, sortOrder: $sortOrder, guide: $guide, mechanicsJson: $mechanicsJson, talentsJson: $talentsJson, shoutsJson: $shoutsJson) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "7ace0571617e2603781186f8dfbc4eb2";

export default node;
