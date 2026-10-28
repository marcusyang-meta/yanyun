/**
 * @generated SignedSource<<bd30b2f51e6ab81973fccb6cff445345>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminOfficerExportMutation$variables = {
  slug: string;
};
export type GuildAdminOfficerExportMutation$data = {
  readonly exportGuildDataPackage: {
    readonly error: string | null | undefined;
    readonly filename: string | null | undefined;
    readonly json: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminOfficerExportMutation = {
  response: GuildAdminOfficerExportMutation$data;
  variables: GuildAdminOfficerExportMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GuildExportPayload",
    "kind": "LinkedField",
    "name": "exportGuildDataPackage",
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
        "name": "json",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "filename",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminOfficerExportMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildAdminOfficerExportMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "0c46256122bc4629476ca86e2ceed411",
    "id": null,
    "metadata": {},
    "name": "GuildAdminOfficerExportMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminOfficerExportMutation(\n  $slug: String!\n) {\n  exportGuildDataPackage(slug: $slug) {\n    ok\n    error\n    json\n    filename\n  }\n}\n"
  }
};
})();

(node as any).hash = "e4489f003d314597bcc1ab27270c47ce";

export default node;
