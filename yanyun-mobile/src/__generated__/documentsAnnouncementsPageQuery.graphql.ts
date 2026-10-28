/**
 * @generated SignedSource<<a41e24e2606bdfb2c733299da5cdeb77>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AnnouncementKind = "STANDARD" | "URGENT" | "%future added value";
export type documentsAnnouncementsPageQuery$variables = {
  slug: string;
};
export type documentsAnnouncementsPageQuery$data = {
  readonly viewer: {
    readonly guild: {
      readonly __typename: "Guild";
      readonly announcements: {
        readonly announcements: ReadonlyArray<{
          readonly authorText: string | null | undefined;
          readonly body: string;
          readonly createdAtText: string;
          readonly id: string;
          readonly kind: AnnouncementKind;
          readonly kindLabel: string;
          readonly title: string;
          readonly urgent: boolean;
          readonly urgentLabel: string | null | undefined;
          readonly viewerHasRead: boolean | null | undefined;
        }>;
        readonly canPost: boolean;
        readonly emptyText: string;
        readonly title: string;
      };
    } | {
      readonly __typename: "GuildReadOnly";
      readonly announcements: {
        readonly announcements: ReadonlyArray<{
          readonly authorText: string | null | undefined;
          readonly body: string;
          readonly createdAtText: string;
          readonly id: string;
          readonly kind: AnnouncementKind;
          readonly kindLabel: string;
          readonly title: string;
          readonly urgent: boolean;
          readonly urgentLabel: string | null | undefined;
          readonly viewerHasRead: boolean | null | undefined;
        }>;
        readonly canPost: boolean;
        readonly emptyText: string;
        readonly title: string;
      };
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
  };
};
export type documentsAnnouncementsPageQuery = {
  response: documentsAnnouncementsPageQuery$data;
  variables: documentsAnnouncementsPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "GuildAnnouncementPage",
    "kind": "LinkedField",
    "name": "announcements",
    "plural": false,
    "selections": [
      (v1/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "emptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "canPost",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GuildAnnouncement",
        "kind": "LinkedField",
        "name": "announcements",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "kind",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "urgent",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "urgentLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "kindLabel",
            "storageKey": null
          },
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "body",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "authorText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAtText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "viewerHasRead",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v3 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "slug",
            "variableName": "slug"
          }
        ],
        "concreteType": null,
        "kind": "LinkedField",
        "name": "guild",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v2/*:: as any*/),
            "type": "Guild",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v2/*:: as any*/),
            "type": "GuildReadOnly",
            "abstractKey": null
          }
        ],
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
    "name": "documentsAnnouncementsPageQuery",
    "selections": (v3/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsAnnouncementsPageQuery",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "c403f0bbfaa27826bc3123f7431ed2a3",
    "id": null,
    "metadata": {},
    "name": "documentsAnnouncementsPageQuery",
    "operationKind": "query",
    "text": "query documentsAnnouncementsPageQuery(\n  $slug: String!\n) {\n  viewer {\n    guild(slug: $slug) {\n      __typename\n      ... on Guild {\n        announcements {\n          title\n          emptyText\n          canPost\n          announcements {\n            id\n            kind\n            urgent\n            urgentLabel\n            kindLabel\n            title\n            body\n            authorText\n            createdAtText\n            viewerHasRead\n          }\n        }\n      }\n      ... on GuildReadOnly {\n        announcements {\n          title\n          emptyText\n          canPost\n          announcements {\n            id\n            kind\n            urgent\n            urgentLabel\n            kindLabel\n            title\n            body\n            authorText\n            createdAtText\n            viewerHasRead\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a357f52e54d6fb751847208e05efc321";

export default node;
