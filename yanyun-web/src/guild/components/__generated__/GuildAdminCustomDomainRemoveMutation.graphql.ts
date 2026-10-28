/**
 * @generated SignedSource<<7762ec65507a952cbbb11b06eb3266b8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminCustomDomainRemoveMutation$variables = {
  slug: string;
};
export type GuildAdminCustomDomainRemoveMutation$data = {
  readonly removeGuildCustomDomain: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminCustomDomainRemoveMutation = {
  response: GuildAdminCustomDomainRemoveMutation$data;
  variables: GuildAdminCustomDomainRemoveMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = [
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
    "name": "GuildAdminCustomDomainRemoveMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "removeGuildCustomDomain",
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
    "name": "GuildAdminCustomDomainRemoveMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "removeGuildCustomDomain",
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
    "cacheID": "773a0c908e94c6dcb3cb66d80d9c1ca7",
    "id": null,
    "metadata": {},
    "name": "GuildAdminCustomDomainRemoveMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminCustomDomainRemoveMutation(\n  $slug: String!\n) {\n  removeGuildCustomDomain(slug: $slug) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "29b1ddbf373f25c83c74676a7e010c35";

export default node;
