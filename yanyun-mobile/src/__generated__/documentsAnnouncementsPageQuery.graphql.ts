/**
 * @generated SignedSource<<4d53db47daca5fe9c9cb1b18d1971631>>
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
          readonly contentSourceLabel: string;
          readonly createdAtText: string;
          readonly displayBody: string;
          readonly displayTitle: string;
          readonly id: string;
          readonly isTranslated: boolean;
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
          readonly contentSourceLabel: string;
          readonly createdAtText: string;
          readonly displayBody: string;
          readonly displayTitle: string;
          readonly id: string;
          readonly isTranslated: boolean;
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
            "name": "displayTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "displayBody",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isTranslated",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "contentSourceLabel",
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
    "cacheID": "0cbd2f3f76545e969ca2fcec3d58eade",
    "id": null,
    "metadata": {},
    "name": "documentsAnnouncementsPageQuery",
    "operationKind": "query",
    "text": "query documentsAnnouncementsPageQuery(\n  $slug: String!\n) {\n  viewer {\n    guild(slug: $slug) {\n      __typename\n      ... on Guild {\n        announcements {\n          title\n          emptyText\n          canPost\n          announcements {\n            id\n            kind\n            urgent\n            urgentLabel\n            kindLabel\n            title\n            body\n            displayTitle\n            displayBody\n            isTranslated\n            contentSourceLabel\n            authorText\n            createdAtText\n            viewerHasRead\n          }\n        }\n      }\n      ... on GuildReadOnly {\n        announcements {\n          title\n          emptyText\n          canPost\n          announcements {\n            id\n            kind\n            urgent\n            urgentLabel\n            kindLabel\n            title\n            body\n            displayTitle\n            displayBody\n            isTranslated\n            contentSourceLabel\n            authorText\n            createdAtText\n            viewerHasRead\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d1939a01296d69c789dabf7ede3b7283";

export default node;
