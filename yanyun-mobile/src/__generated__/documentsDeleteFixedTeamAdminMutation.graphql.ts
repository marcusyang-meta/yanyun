/**
 * @generated SignedSource<<a80b04fb4f0b5be642aa21729dbdbdcd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteFixedTeamAdminMutation$variables = {
  slug: string;
  teamId: string;
};
export type documentsDeleteFixedTeamAdminMutation$data = {
  readonly deleteFixedTeam: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteFixedTeamAdminMutation = {
  response: documentsDeleteFixedTeamAdminMutation$data;
  variables: documentsDeleteFixedTeamAdminMutation$variables;
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
    "name": "teamId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  },
  {
    "kind": "Variable",
    "name": "teamId",
    "variableName": "teamId"
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
    "name": "documentsDeleteFixedTeamAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteFixedTeam",
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
    "name": "documentsDeleteFixedTeamAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "deleteFixedTeam",
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
    "cacheID": "b3270f220b63671864311a6f3c731841",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteFixedTeamAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteFixedTeamAdminMutation(\n  $slug: String!\n  $teamId: ID!\n) {\n  deleteFixedTeam(slug: $slug, teamId: $teamId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "f11c289a26e6b831988174a3a259fbd6";

export default node;
