/**
 * @generated SignedSource<<5460257aada7d966186dae05e9a1aff1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAnnouncementsMarkReadMutation$variables = {
  id: string;
  slug: string;
};
export type GuildAnnouncementsMarkReadMutation$data = {
  readonly markGuildAnnouncementRead: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAnnouncementsMarkReadMutation = {
  response: GuildAnnouncementsMarkReadMutation$data;
  variables: GuildAnnouncementsMarkReadMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
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
        "name": "announcementId",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GuildAnnouncementPayload",
    "kind": "LinkedField",
    "name": "markGuildAnnouncementRead",
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
        "name": "errorCode",
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
    "name": "GuildAnnouncementsMarkReadMutation",
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
    "name": "GuildAnnouncementsMarkReadMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "0736d431b0a35cfeb6d1c1ccb4fffd1e",
    "id": null,
    "metadata": {},
    "name": "GuildAnnouncementsMarkReadMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAnnouncementsMarkReadMutation(\n  $slug: String!\n  $id: ID!\n) {\n  markGuildAnnouncementRead(slug: $slug, announcementId: $id) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "5a30527346b775894a7d35ef3ae7c4ee";

export default node;
