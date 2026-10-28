/**
 * @generated SignedSource<<4e64b0fac814062fa1c6dc2ad873298a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminRecruitOpenMutation$variables = {
  open: boolean;
  slug: string;
};
export type GuildAdminRecruitOpenMutation$data = {
  readonly updateGuildRecruitOpen: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminRecruitOpenMutation = {
  response: GuildAdminRecruitOpenMutation$data;
  variables: GuildAdminRecruitOpenMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "open"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "open",
    "variableName": "open"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v4 = {
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
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminRecruitOpenMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildRecruitOpen",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/)
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
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminRecruitOpenMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildRecruitOpen",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
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
    "cacheID": "1c8bf77c50adfb62484517ea200307d7",
    "id": null,
    "metadata": {},
    "name": "GuildAdminRecruitOpenMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminRecruitOpenMutation(\n  $slug: String!\n  $open: Boolean!\n) {\n  updateGuildRecruitOpen(slug: $slug, open: $open) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1809fb1f4295c0f8711081e0a4e1376b";

export default node;
