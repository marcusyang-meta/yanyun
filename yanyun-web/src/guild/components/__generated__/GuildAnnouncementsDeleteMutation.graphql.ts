/**
 * @generated SignedSource<<cc4fe82289c448508be75b63ead7c3c7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAnnouncementsDeleteMutation$variables = {
  id: string;
  slug: string;
};
export type GuildAnnouncementsDeleteMutation$data = {
  readonly deleteGuildAnnouncement: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAnnouncementsDeleteMutation = {
  response: GuildAnnouncementsDeleteMutation$data;
  variables: GuildAnnouncementsDeleteMutation$variables;
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
    "name": "deleteGuildAnnouncement",
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
    "name": "GuildAnnouncementsDeleteMutation",
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
    "name": "GuildAnnouncementsDeleteMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "d671c1f9c57ccae13c1f7e403dc88956",
    "id": null,
    "metadata": {},
    "name": "GuildAnnouncementsDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAnnouncementsDeleteMutation(\n  $slug: String!\n  $id: ID!\n) {\n  deleteGuildAnnouncement(slug: $slug, announcementId: $id) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "b96399212afc41a5170584ae0106b045";

export default node;
