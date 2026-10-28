/**
 * @generated SignedSource<<e74f5f4178af540ea3c19ebb31c8dd6e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteGuildAnnouncementMutation$variables = {
  id: string;
  slug: string;
};
export type documentsDeleteGuildAnnouncementMutation$data = {
  readonly deleteGuildAnnouncement: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteGuildAnnouncementMutation = {
  response: documentsDeleteGuildAnnouncementMutation$data;
  variables: documentsDeleteGuildAnnouncementMutation$variables;
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
    "name": "documentsDeleteGuildAnnouncementMutation",
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
    "name": "documentsDeleteGuildAnnouncementMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "60bb72d3b39faae14ebc5e7071d487db",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteGuildAnnouncementMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteGuildAnnouncementMutation(\n  $slug: String!\n  $id: ID!\n) {\n  deleteGuildAnnouncement(slug: $slug, announcementId: $id) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "73db367f460476b05a59412f858e820f";

export default node;
