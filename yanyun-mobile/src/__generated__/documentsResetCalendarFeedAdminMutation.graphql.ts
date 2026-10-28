/**
 * @generated SignedSource<<430cdfe962d83fc7b74927ea77dbd0fb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsResetCalendarFeedAdminMutation$variables = {
  slug: string;
};
export type documentsResetCalendarFeedAdminMutation$data = {
  readonly resetCalendarFeed: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsResetCalendarFeedAdminMutation = {
  response: documentsResetCalendarFeedAdminMutation$data;
  variables: documentsResetCalendarFeedAdminMutation$variables;
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
    "name": "documentsResetCalendarFeedAdminMutation",
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
    "name": "documentsResetCalendarFeedAdminMutation",
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
    "cacheID": "30aafd803792e1bb3731f1b1fee112e1",
    "id": null,
    "metadata": {},
    "name": "documentsResetCalendarFeedAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsResetCalendarFeedAdminMutation(\n  $slug: String!\n) {\n  resetCalendarFeed(slug: $slug) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e06c1898ea4dc1f4296479fd8ec0f49f";

export default node;
