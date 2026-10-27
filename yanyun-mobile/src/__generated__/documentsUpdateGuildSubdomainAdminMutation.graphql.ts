/**
 * @generated SignedSource<<f31a57890f80fb01df889cdbe056ceea>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUpdateGuildSubdomainAdminMutation$variables = {
  enabled: boolean;
  slug: string;
};
export type documentsUpdateGuildSubdomainAdminMutation$data = {
  readonly updateGuildSubdomain: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateGuildSubdomainAdminMutation = {
  response: documentsUpdateGuildSubdomainAdminMutation$data;
  variables: documentsUpdateGuildSubdomainAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enabled"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "enabled",
    "variableName": "enabled"
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
    "name": "documentsUpdateGuildSubdomainAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildSubdomain",
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
    "name": "documentsUpdateGuildSubdomainAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildSubdomain",
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
    "cacheID": "4decfcb154ae1464672b0fd4b25b01ec",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGuildSubdomainAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGuildSubdomainAdminMutation(\n  $slug: String!\n  $enabled: Boolean!\n) {\n  updateGuildSubdomain(slug: $slug, enabled: $enabled) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e081f6621cd33aa4b9f02644a37d1b24";

export default node;
