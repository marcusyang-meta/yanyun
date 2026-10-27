/**
 * @generated SignedSource<<23fa4ee6b19e3740ebe5deea55a419a5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUpdateGuildWhiteLabelAdminMutation$variables = {
  hideBranding: boolean;
  ogAccent: string;
  ogTitleSuffix?: string | null | undefined;
  slug: string;
};
export type documentsUpdateGuildWhiteLabelAdminMutation$data = {
  readonly updateGuildWhiteLabel: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateGuildWhiteLabelAdminMutation = {
  response: documentsUpdateGuildWhiteLabelAdminMutation$data;
  variables: documentsUpdateGuildWhiteLabelAdminMutation$variables;
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
    "name": "documentsUpdateGuildWhiteLabelAdminMutation",
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
    "name": "documentsUpdateGuildWhiteLabelAdminMutation",
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
    "cacheID": "61fd7127eaec988e4adc90ee56954515",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGuildWhiteLabelAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGuildWhiteLabelAdminMutation(\n  $slug: String!\n  $hideBranding: Boolean!\n  $ogAccent: String!\n  $ogTitleSuffix: String\n) {\n  updateGuildWhiteLabel(slug: $slug, hideBranding: $hideBranding, ogAccent: $ogAccent, ogTitleSuffix: $ogTitleSuffix) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e67c73c05530e4ceed7e41861dbecd36";

export default node;
