/**
 * @generated SignedSource<<4bf4d02f28b15c99d2f00970fdf286a7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminToolsResetCalendarMutation$variables = {
  slug: string;
};
export type GuildAdminToolsResetCalendarMutation$data = {
  readonly resetCalendarFeed: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminToolsResetCalendarMutation = {
  response: GuildAdminToolsResetCalendarMutation$data;
  variables: GuildAdminToolsResetCalendarMutation$variables;
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
    "name": "GuildAdminToolsResetCalendarMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "resetCalendarFeed",
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
    "name": "GuildAdminToolsResetCalendarMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "resetCalendarFeed",
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
    "cacheID": "9059c01ed623b44b441ea92afb5e17d8",
    "id": null,
    "metadata": {},
    "name": "GuildAdminToolsResetCalendarMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminToolsResetCalendarMutation(\n  $slug: String!\n) {\n  resetCalendarFeed(slug: $slug) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "05f1fdf634ffbcc47df889cfa6403329";

export default node;
