/**
 * @generated SignedSource<<418f9263d1703e1a70a490dc7718778c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminRecruitReviewMutation$variables = {
  approve: boolean;
  id: string;
  slug: string;
};
export type GuildAdminRecruitReviewMutation$data = {
  readonly reviewGuildApplication: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminRecruitReviewMutation = {
  response: GuildAdminRecruitReviewMutation$data;
  variables: GuildAdminRecruitReviewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "approve"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "applicationId",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "approve",
    "variableName": "approve"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v5 = {
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
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminRecruitReviewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "reviewGuildApplication",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/)
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
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminRecruitReviewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "reviewGuildApplication",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
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
    "cacheID": "50d7f2783a60fe68f06545e7f4eabb46",
    "id": null,
    "metadata": {},
    "name": "GuildAdminRecruitReviewMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminRecruitReviewMutation(\n  $slug: String!\n  $id: ID!\n  $approve: Boolean!\n) {\n  reviewGuildApplication(slug: $slug, applicationId: $id, approve: $approve) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4958e990f23f0b660df229ef7d9db7a";

export default node;
