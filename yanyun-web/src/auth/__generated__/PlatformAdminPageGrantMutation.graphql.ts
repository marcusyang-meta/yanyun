/**
 * @generated SignedSource<<9b8686bd42fb118d91024a132ed76168>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageGrantMutation$variables = {
  days: number;
  slug: string;
  tier?: string | null | undefined;
};
export type PlatformAdminPageGrantMutation$data = {
  readonly platformAdminGrantPremium: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageGrantMutation = {
  response: PlatformAdminPageGrantMutation$data;
  variables: PlatformAdminPageGrantMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "days"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "tier"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "days",
        "variableName": "days"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      },
      {
        "kind": "Variable",
        "name": "tier",
        "variableName": "tier"
      }
    ],
    "concreteType": "PlatformAdminBillingPayload",
    "kind": "LinkedField",
    "name": "platformAdminGrantPremium",
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
    "name": "PlatformAdminPageGrantMutation",
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
    "name": "PlatformAdminPageGrantMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "1918754c7c0a5bd497619dc9a0ec0b87",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageGrantMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageGrantMutation(\n  $slug: String!\n  $days: Int!\n  $tier: String\n) {\n  platformAdminGrantPremium(slug: $slug, days: $days, tier: $tier) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "e8dc7222c8a36db838e7c18574700442";

export default node;
