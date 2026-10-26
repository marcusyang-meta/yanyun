/**
 * @generated SignedSource<<352f7c36857c6300918d390bd40ad258>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminPageFeaturesMutation$variables = {
  slug: string;
  v: boolean;
};
export type GuildAdminPageFeaturesMutation$data = {
  readonly updateGuildFeatures: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPageFeaturesMutation = {
  response: GuildAdminPageFeaturesMutation$data;
  variables: GuildAdminPageFeaturesMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "v"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "fixedTeams",
    "variableName": "v"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminPageFeaturesMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildFeatures",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildAdminPageFeaturesMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildFeatures",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
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
    "cacheID": "db6e61922c8e9948c0fb6c59d3f15b41",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPageFeaturesMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPageFeaturesMutation(\n  $slug: String!\n  $v: Boolean!\n) {\n  updateGuildFeatures(slug: $slug, fixedTeams: $v) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "08373caeabede9a92728992f315690e8";

export default node;
