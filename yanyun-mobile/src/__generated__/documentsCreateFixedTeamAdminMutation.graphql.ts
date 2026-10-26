/**
 * @generated SignedSource<<6a38432a31854f2b087a8bcd59b3f214>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateFixedTeamInput = {
  description?: string | null | undefined;
  name: string;
};
export type documentsCreateFixedTeamAdminMutation$variables = {
  input: CreateFixedTeamInput;
  slug: string;
};
export type documentsCreateFixedTeamAdminMutation$data = {
  readonly createFixedTeam: {
    readonly error: string | null | undefined;
    readonly id: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsCreateFixedTeamAdminMutation = {
  response: documentsCreateFixedTeamAdminMutation$data;
  variables: documentsCreateFixedTeamAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GuildAdminPayload",
    "kind": "LinkedField",
    "name": "createFixedTeam",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      },
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsCreateFixedTeamAdminMutation",
    "selections": (v2/*:: as any*/),
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
    "name": "documentsCreateFixedTeamAdminMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "7751efcb6562a5f75c3362c4c8b8f750",
    "id": null,
    "metadata": {},
    "name": "documentsCreateFixedTeamAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCreateFixedTeamAdminMutation(\n  $slug: String!\n  $input: CreateFixedTeamInput!\n) {\n  createFixedTeam(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "165b1429c2b245244b27a67f28967505";

export default node;
