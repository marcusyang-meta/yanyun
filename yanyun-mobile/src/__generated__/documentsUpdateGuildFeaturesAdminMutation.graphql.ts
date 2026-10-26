/**
 * @generated SignedSource<<1ac575ecb84af9edaa076a1478a5fbb5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUpdateGuildFeaturesAdminMutation$variables = {
  fixedTeams: boolean;
  slug: string;
};
export type documentsUpdateGuildFeaturesAdminMutation$data = {
  readonly updateGuildFeatures: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateGuildFeaturesAdminMutation = {
  response: documentsUpdateGuildFeaturesAdminMutation$data;
  variables: documentsUpdateGuildFeaturesAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "fixedTeams"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "fixedTeams",
    "variableName": "fixedTeams"
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
    "name": "documentsUpdateGuildFeaturesAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildFeatures",
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
    "name": "documentsUpdateGuildFeaturesAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildFeatures",
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
    "cacheID": "e69812d96a9d2a8cc226989c759fd940",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGuildFeaturesAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGuildFeaturesAdminMutation(\n  $slug: String!\n  $fixedTeams: Boolean!\n) {\n  updateGuildFeatures(slug: $slug, fixedTeams: $fixedTeams) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "35116235afcdfb0b78edbcb8c4e30860";

export default node;
