/**
 * @generated SignedSource<<7870b90da1697ec77873f73b20335886>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminPageWhiteLabelMutation$variables = {
  hideBranding: boolean;
  ogAccent: string;
  ogTitleSuffix?: string | null | undefined;
  slug: string;
};
export type GuildAdminPageWhiteLabelMutation$data = {
  readonly updateGuildWhiteLabel: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPageWhiteLabelMutation = {
  response: GuildAdminPageWhiteLabelMutation$data;
  variables: GuildAdminPageWhiteLabelMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "hideBranding"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "ogAccent"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "ogTitleSuffix"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v4 = [
  {
    "kind": "Variable",
    "name": "hideBranding",
    "variableName": "hideBranding"
  },
  {
    "kind": "Variable",
    "name": "ogAccent",
    "variableName": "ogAccent"
  },
  {
    "kind": "Variable",
    "name": "ogTitleSuffix",
    "variableName": "ogTitleSuffix"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
};
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
    "name": "GuildAdminPageWhiteLabelMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildWhiteLabel",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          (v6/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminPageWhiteLabelMutation",
    "selections": [
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildWhiteLabel",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "bfab9ebfa108468cf7c3b02bfa14d33e",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPageWhiteLabelMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPageWhiteLabelMutation(\n  $slug: String!\n  $hideBranding: Boolean!\n  $ogAccent: String!\n  $ogTitleSuffix: String\n) {\n  updateGuildWhiteLabel(slug: $slug, hideBranding: $hideBranding, ogAccent: $ogAccent, ogTitleSuffix: $ogTitleSuffix) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "86cc513fadb1b1ad18ff8de96d0166b2";

export default node;
