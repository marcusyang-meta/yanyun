/**
 * @generated SignedSource<<8883b86288e05b37fe6d8a54de3c10f5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type documentsGroupingDetailBlocksQuery$variables = {
  blocksVersion?: number | null | undefined;
  id: string;
  slug?: string | null | undefined;
};
export type documentsGroupingDetailBlocksQuery$data = {
  readonly groupingDetailPage: {
    readonly blocks: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockNode1">;
    }>;
  };
};
export type documentsGroupingDetailBlocksQuery = {
  response: documentsGroupingDetailBlocksQuery$data;
  variables: documentsGroupingDetailBlocksQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "blocksVersion"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v4 = [
  {
    "kind": "Variable",
    "name": "blocksVersion",
    "variableName": "blocksVersion"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isBlock"
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "text",
  "storageKey": null
},
v8 = {
  "kind": "InlineFragment",
  "selections": [
    (v7/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "variant",
      "storageKey": null
    }
  ],
  "type": "TextBlock",
  "abstractKey": null
},
v9 = [
  (v7/*:: as any*/)
],
v10 = {
  "kind": "InlineFragment",
  "selections": (v9/*:: as any*/),
  "type": "BannerBlock",
  "abstractKey": null
},
v11 = {
  "kind": "InlineFragment",
  "selections": (v9/*:: as any*/),
  "type": "SectionHeaderBlock",
  "abstractKey": null
},
v12 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "chips",
      "storageKey": null
    }
  ],
  "type": "ChipRowBlock",
  "abstractKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "groupingId",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmTitle",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmMessage",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "okLabel",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cancelLabel",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "action",
  "plural": false,
  "selections": [
    (v5/*:: as any*/),
    {
      "kind": "TypeDiscriminator",
      "abstractKey": "__isAction"
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "slug",
          "storageKey": null
        },
        (v13/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "readOnly",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nick",
          "storageKey": null
        }
      ],
      "type": "NavigateAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v13/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "seatIndex",
          "storageKey": null
        }
      ],
      "type": "JoinAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v13/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uid",
          "storageKey": null
        },
        (v14/*:: as any*/),
        (v15/*:: as any*/),
        (v16/*:: as any*/),
        (v17/*:: as any*/)
      ],
      "type": "LeaveAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v13/*:: as any*/),
        (v14/*:: as any*/),
        (v15/*:: as any*/),
        (v16/*:: as any*/),
        (v17/*:: as any*/)
      ],
      "type": "DisbandAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v13/*:: as any*/)
      ],
      "type": "EditAction",
      "abstractKey": null
    }
  ],
  "storageKey": null
},
v19 = {
  "kind": "InlineFragment",
  "selections": [
    (v13/*:: as any*/),
    {
      "alias": "cardTitle",
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "badgeText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "timeText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "dungeonName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "peopleText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "statusText",
      "storageKey": null
    },
    (v18/*:: as any*/)
  ],
  "type": "GroupingCardBlock",
  "abstractKey": null
},
v20 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "SeatEntry",
      "kind": "LinkedField",
      "name": "seats",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "index",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "occupied",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nickname",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "weapon",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "role",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "healer",
          "storageKey": null
        },
        (v18/*:: as any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "SeatGridBlock",
  "abstractKey": null
},
v21 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "label",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "style",
      "storageKey": null
    },
    (v18/*:: as any*/)
  ],
  "type": "ActionButtonBlock",
  "abstractKey": null
},
v22 = {
  "kind": "InlineFragment",
  "selections": (v9/*:: as any*/),
  "type": "EmptyStateBlock",
  "abstractKey": null
},
v23 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "size",
      "storageKey": null
    }
  ],
  "type": "SpacerBlock",
  "abstractKey": null
},
v24 = {
  "kind": "InlineFragment",
  "selections": (v9/*:: as any*/),
  "type": "FallbackBlock",
  "abstractKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGroupingDetailBlocksQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GroupingDetailPage",
        "kind": "LinkedField",
        "name": "groupingDetailPage",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "blocks",
            "plural": true,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_BlockNode1"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsGroupingDetailBlocksQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GroupingDetailPage",
        "kind": "LinkedField",
        "name": "groupingDetailPage",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "blocks",
            "plural": true,
            "selections": [
              (v5/*:: as any*/),
              (v6/*:: as any*/),
              (v8/*:: as any*/),
              (v10/*:: as any*/),
              (v11/*:: as any*/),
              (v12/*:: as any*/),
              (v19/*:: as any*/),
              (v20/*:: as any*/),
              (v21/*:: as any*/),
              (v22/*:: as any*/),
              (v23/*:: as any*/),
              (v24/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v25/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "children",
                    "plural": true,
                    "selections": [
                      (v5/*:: as any*/),
                      (v6/*:: as any*/),
                      (v8/*:: as any*/),
                      (v10/*:: as any*/),
                      (v11/*:: as any*/),
                      (v12/*:: as any*/),
                      (v19/*:: as any*/),
                      (v20/*:: as any*/),
                      (v21/*:: as any*/),
                      (v22/*:: as any*/),
                      (v23/*:: as any*/),
                      (v24/*:: as any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v25/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "children",
                            "plural": true,
                            "selections": [
                              (v5/*:: as any*/),
                              (v6/*:: as any*/),
                              (v8/*:: as any*/),
                              (v10/*:: as any*/),
                              (v11/*:: as any*/),
                              (v12/*:: as any*/),
                              (v19/*:: as any*/),
                              (v20/*:: as any*/),
                              (v21/*:: as any*/),
                              (v22/*:: as any*/),
                              (v23/*:: as any*/),
                              (v24/*:: as any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "SectionBlock",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "type": "SectionBlock",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "44d3d15ac1595fbc77939b63736c01f1",
    "id": null,
    "metadata": {},
    "name": "documentsGroupingDetailBlocksQuery",
    "operationKind": "query",
    "text": "query documentsGroupingDetailBlocksQuery(\n  $slug: String\n  $id: ID!\n  $blocksVersion: Int\n) {\n  groupingDetailPage(slug: $slug, id: $id) {\n    blocks(blocksVersion: $blocksVersion) {\n      __typename\n      ...fragments_BlockNode1\n    }\n  }\n}\n\nfragment fragments_ActionButtonBlock on ActionButtonBlock {\n  label\n  style\n  action {\n    __typename\n    ...fragments_BlockAction\n  }\n}\n\nfragment fragments_BannerBlock on BannerBlock {\n  text\n}\n\nfragment fragments_BlockAction on Action {\n  __isAction: __typename\n  __typename\n  ... on NavigateAction {\n    slug\n    groupingId\n    name\n    readOnly\n    nick\n  }\n  ... on JoinAction {\n    groupingId\n    seatIndex\n  }\n  ... on LeaveAction {\n    groupingId\n    uid\n    confirmTitle\n    confirmMessage\n    okLabel\n    cancelLabel\n  }\n  ... on DisbandAction {\n    groupingId\n    confirmTitle\n    confirmMessage\n    okLabel\n    cancelLabel\n  }\n  ... on EditAction {\n    groupingId\n  }\n}\n\nfragment fragments_BlockLeaf on Block {\n  __isBlock: __typename\n  __typename\n  ... on TextBlock {\n    ...fragments_TextBlock\n  }\n  ... on BannerBlock {\n    ...fragments_BannerBlock\n  }\n  ... on SectionHeaderBlock {\n    ...fragments_SectionHeaderBlock\n  }\n  ... on ChipRowBlock {\n    ...fragments_ChipRowBlock\n  }\n  ... on GroupingCardBlock {\n    ...fragments_GroupingCardBlock\n  }\n  ... on SeatGridBlock {\n    ...fragments_SeatGridBlock\n  }\n  ... on ActionButtonBlock {\n    ...fragments_ActionButtonBlock\n  }\n  ... on EmptyStateBlock {\n    ...fragments_EmptyStateBlock\n  }\n  ... on SpacerBlock {\n    ...fragments_SpacerBlock\n  }\n  ... on FallbackBlock {\n    ...fragments_FallbackBlock\n  }\n}\n\nfragment fragments_BlockNode1 on Block {\n  __isBlock: __typename\n  __typename\n  ...fragments_BlockLeaf\n  ... on SectionBlock {\n    title\n    children {\n      __typename\n      ...fragments_BlockNode2\n    }\n  }\n}\n\nfragment fragments_BlockNode2 on Block {\n  __isBlock: __typename\n  __typename\n  ...fragments_BlockLeaf\n  ... on SectionBlock {\n    title\n    children {\n      __typename\n      ...fragments_BlockLeaf\n    }\n  }\n}\n\nfragment fragments_ChipRowBlock on ChipRowBlock {\n  chips\n}\n\nfragment fragments_EmptyStateBlock on EmptyStateBlock {\n  text\n}\n\nfragment fragments_FallbackBlock on FallbackBlock {\n  text\n}\n\nfragment fragments_GroupingCardBlock on GroupingCardBlock {\n  groupingId\n  cardTitle: title\n  badgeText\n  timeText\n  dungeonName\n  peopleText\n  statusText\n  action {\n    __typename\n    ...fragments_BlockAction\n  }\n}\n\nfragment fragments_SeatGridBlock on SeatGridBlock {\n  seats {\n    index\n    occupied\n    nickname\n    weapon\n    role\n    healer\n    action {\n      __typename\n      ...fragments_BlockAction\n    }\n  }\n}\n\nfragment fragments_SectionHeaderBlock on SectionHeaderBlock {\n  text\n}\n\nfragment fragments_SpacerBlock on SpacerBlock {\n  size\n}\n\nfragment fragments_TextBlock on TextBlock {\n  text\n  variant\n}\n"
  }
};
})();

(node as any).hash = "703cc783a603ca7311065eba855f71b8";

export default node;
