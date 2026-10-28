/**
 * @generated SignedSource<<ad387e837f05796391ae47e3bf0ca5dc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUpdateGuildRecruitOpenAdminMutation$variables = {
  open: boolean;
  slug: string;
};
export type documentsUpdateGuildRecruitOpenAdminMutation$data = {
  readonly updateGuildRecruitOpen: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateGuildRecruitOpenAdminMutation = {
  response: documentsUpdateGuildRecruitOpenAdminMutation$data;
  variables: documentsUpdateGuildRecruitOpenAdminMutation$variables;
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
    "name": "documentsUpdateGuildRecruitOpenAdminMutation",
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
    "name": "documentsUpdateGuildRecruitOpenAdminMutation",
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
    "cacheID": "1683cc65dc09784d7a167d8189e28863",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGuildRecruitOpenAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGuildRecruitOpenAdminMutation(\n  $slug: String!\n  $open: Boolean!\n) {\n  updateGuildRecruitOpen(slug: $slug, open: $open) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "db115011b30976ae8be086e4b2ac5bc2";

export default node;
