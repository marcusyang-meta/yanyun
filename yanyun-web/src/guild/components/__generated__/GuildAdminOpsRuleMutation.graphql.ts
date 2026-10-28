/**
 * @generated SignedSource<<26693af37458a4215b14d45273947b14>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOpsRuleMutation$variables = {
  actionKey: string;
  enabled: boolean;
  points: number;
  slug: string;
};
export type GuildAdminOpsRuleMutation$data = {
  readonly updateContributionRule: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminOpsRuleMutation = {
  response: GuildAdminOpsRuleMutation$data;
  variables: GuildAdminOpsRuleMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "actionKey"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enabled"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "points"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "actionKey",
        "variableName": "actionKey"
      },
      {
        "kind": "Variable",
        "name": "enabled",
        "variableName": "enabled"
      },
      {
        "kind": "Variable",
        "name": "points",
        "variableName": "points"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "OpsPayload",
    "kind": "LinkedField",
    "name": "updateContributionRule",
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
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminOpsRuleMutation",
    "selections": (v4/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*:: as any*/),
      (v0/*:: as any*/),
      (v2/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminOpsRuleMutation",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "fc997375eea76bf3e2beeba72eaced47",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOpsRuleMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminOpsRuleMutation(\n  $slug: String!\n  $actionKey: String!\n  $points: Int!\n  $enabled: Boolean!\n) {\n  updateContributionRule(slug: $slug, actionKey: $actionKey, points: $points, enabled: $enabled) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4b79187b79430e2761608b53cda9b40";

export default node;
