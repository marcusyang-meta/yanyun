/**
 * @generated SignedSource<<30e12820b1b20bfd86c7214d3f010ec0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GroupingTab = "ACTIVITY" | "RACE" | "TALENT" | "%future added value";
export type documentsGroupingListBlocksQuery$variables = {
  blocksVersion?: number | null | undefined;
  slug: string;
  tab: GroupingTab;
  weekOffset?: number | null | undefined;
};
export type documentsGroupingListBlocksQuery$data = {
  readonly groupingListPage: {
    readonly blocks: ReadonlyArray<{
      readonly __typename: string;
      readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockNode1">;
    }>;
  };
};
export type documentsGroupingListBlocksQuery = {
  response: documentsGroupingListBlocksQuery$data;
  variables: documentsGroupingListBlocksQuery$variables;
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
  "name": "slug"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "tab"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "weekOffset"
},
v4 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  },
  {
    "kind": "Variable",
    "name": "tab",
    "variableName": "tab"
  }
],
v5 = [
  {
    "kind": "Variable",
    "name": "blocksVersion",
    "variableName": "blocksVersion"
  },
  {
    "kind": "Variable",
    "name": "weekOffset",
    "variableName": "weekOffset"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isBlock"
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "text",
  "storageKey": null
},
v9 = {
  "kind": "InlineFragment",
  "selections": [
    (v8/*:: as any*/),
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
v10 = [
  (v8/*:: as any*/)
],
v11 = {
  "kind": "InlineFragment",
  "selections": (v10/*:: as any*/),
  "type": "BannerBlock",
  "abstractKey": null
},
v12 = {
  "kind": "InlineFragment",
  "selections": (v10/*:: as any*/),
  "type": "SectionHeaderBlock",
  "abstractKey": null
},
v13 = {
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
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "groupingId",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmTitle",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmMessage",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "okLabel",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cancelLabel",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "action",
  "plural": false,
  "selections": [
    (v6/*:: as any*/),
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
        (v14/*:: as any*/),
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
        (v14/*:: as any*/),
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
        (v14/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uid",
          "storageKey": null
        },
        (v15/*:: as any*/),
        (v16/*:: as any*/),
        (v17/*:: as any*/),
        (v18/*:: as any*/)
      ],
      "type": "LeaveAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v14/*:: as any*/),
        (v15/*:: as any*/),
        (v16/*:: as any*/),
        (v17/*:: as any*/),
        (v18/*:: as any*/)
      ],
      "type": "DisbandAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v14/*:: as any*/)
      ],
      "type": "EditAction",
      "abstractKey": null
    }
  ],
  "storageKey": null
},
v20 = {
  "kind": "InlineFragment",
  "selections": [
    (v14/*:: as any*/),
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
    (v19/*:: as any*/)
  ],
  "type": "GroupingCardBlock",
  "abstractKey": null
},
v21 = {
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
        (v19/*:: as any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "SeatGridBlock",
  "abstractKey": null
},
v22 = {
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
    (v19/*:: as any*/)
  ],
  "type": "ActionButtonBlock",
  "abstractKey": null
},
v23 = {
  "kind": "InlineFragment",
  "selections": (v10/*:: as any*/),
  "type": "EmptyStateBlock",
  "abstractKey": null
},
v24 = {
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
v25 = {
  "kind": "InlineFragment",
  "selections": (v10/*:: as any*/),
  "type": "FallbackBlock",
  "abstractKey": null
},
v26 = {
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
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGroupingListBlocksQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "GroupingListPage",
        "kind": "LinkedField",
        "name": "groupingListPage",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v5/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "blocks",
            "plural": true,
            "selections": [
              (v6/*:: as any*/),
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
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsGroupingListBlocksQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "GroupingListPage",
        "kind": "LinkedField",
        "name": "groupingListPage",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v5/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "blocks",
            "plural": true,
            "selections": [
              (v6/*:: as any*/),
              (v7/*:: as any*/),
              (v9/*:: as any*/),
              (v11/*:: as any*/),
              (v12/*:: as any*/),
              (v13/*:: as any*/),
              (v20/*:: as any*/),
              (v21/*:: as any*/),
              (v22/*:: as any*/),
              (v23/*:: as any*/),
              (v24/*:: as any*/),
              (v25/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v26/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "children",
                    "plural": true,
                    "selections": [
                      (v6/*:: as any*/),
                      (v7/*:: as any*/),
                      (v9/*:: as any*/),
                      (v11/*:: as any*/),
                      (v12/*:: as any*/),
                      (v13/*:: as any*/),
                      (v20/*:: as any*/),
                      (v21/*:: as any*/),
                      (v22/*:: as any*/),
                      (v23/*:: as any*/),
                      (v24/*:: as any*/),
                      (v25/*:: as any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v26/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "children",
                            "plural": true,
                            "selections": [
                              (v6/*:: as any*/),
                              (v7/*:: as any*/),
                              (v9/*:: as any*/),
                              (v11/*:: as any*/),
                              (v12/*:: as any*/),
                              (v13/*:: as any*/),
                              (v20/*:: as any*/),
                              (v21/*:: as any*/),
                              (v22/*:: as any*/),
                              (v23/*:: as any*/),
                              (v24/*:: as any*/),
                              (v25/*:: as any*/)
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
    "cacheID": "ceea74baed29c951da9131b0c851cbd2",
    "id": null,
    "metadata": {},
    "name": "documentsGroupingListBlocksQuery",
    "operationKind": "query",
    "text": "query documentsGroupingListBlocksQuery(\n  $slug: String!\n  $tab: GroupingTab!\n  $weekOffset: Int\n  $blocksVersion: Int\n) {\n  groupingListPage(slug: $slug, tab: $tab) {\n    blocks(blocksVersion: $blocksVersion, weekOffset: $weekOffset) {\n      __typename\n      ...fragments_BlockNode1\n    }\n  }\n}\n\nfragment fragments_ActionButtonBlock on ActionButtonBlock {\n  label\n  style\n  action {\n    __typename\n    ...fragments_BlockAction\n  }\n}\n\nfragment fragments_BannerBlock on BannerBlock {\n  text\n}\n\nfragment fragments_BlockAction on Action {\n  __isAction: __typename\n  __typename\n  ... on NavigateAction {\n    slug\n    groupingId\n    name\n    readOnly\n    nick\n  }\n  ... on JoinAction {\n    groupingId\n    seatIndex\n  }\n  ... on LeaveAction {\n    groupingId\n    uid\n    confirmTitle\n    confirmMessage\n    okLabel\n    cancelLabel\n  }\n  ... on DisbandAction {\n    groupingId\n    confirmTitle\n    confirmMessage\n    okLabel\n    cancelLabel\n  }\n  ... on EditAction {\n    groupingId\n  }\n}\n\nfragment fragments_BlockLeaf on Block {\n  __isBlock: __typename\n  __typename\n  ... on TextBlock {\n    ...fragments_TextBlock\n  }\n  ... on BannerBlock {\n    ...fragments_BannerBlock\n  }\n  ... on SectionHeaderBlock {\n    ...fragments_SectionHeaderBlock\n  }\n  ... on ChipRowBlock {\n    ...fragments_ChipRowBlock\n  }\n  ... on GroupingCardBlock {\n    ...fragments_GroupingCardBlock\n  }\n  ... on SeatGridBlock {\n    ...fragments_SeatGridBlock\n  }\n  ... on ActionButtonBlock {\n    ...fragments_ActionButtonBlock\n  }\n  ... on EmptyStateBlock {\n    ...fragments_EmptyStateBlock\n  }\n  ... on SpacerBlock {\n    ...fragments_SpacerBlock\n  }\n  ... on FallbackBlock {\n    ...fragments_FallbackBlock\n  }\n}\n\nfragment fragments_BlockNode1 on Block {\n  __isBlock: __typename\n  __typename\n  ...fragments_BlockLeaf\n  ... on SectionBlock {\n    title\n    children {\n      __typename\n      ...fragments_BlockNode2\n    }\n  }\n}\n\nfragment fragments_BlockNode2 on Block {\n  __isBlock: __typename\n  __typename\n  ...fragments_BlockLeaf\n  ... on SectionBlock {\n    title\n    children {\n      __typename\n      ...fragments_BlockLeaf\n    }\n  }\n}\n\nfragment fragments_ChipRowBlock on ChipRowBlock {\n  chips\n}\n\nfragment fragments_EmptyStateBlock on EmptyStateBlock {\n  text\n}\n\nfragment fragments_FallbackBlock on FallbackBlock {\n  text\n}\n\nfragment fragments_GroupingCardBlock on GroupingCardBlock {\n  groupingId\n  cardTitle: title\n  badgeText\n  timeText\n  dungeonName\n  peopleText\n  statusText\n  action {\n    __typename\n    ...fragments_BlockAction\n  }\n}\n\nfragment fragments_SeatGridBlock on SeatGridBlock {\n  seats {\n    index\n    occupied\n    nickname\n    weapon\n    role\n    healer\n    action {\n      __typename\n      ...fragments_BlockAction\n    }\n  }\n}\n\nfragment fragments_SectionHeaderBlock on SectionHeaderBlock {\n  text\n}\n\nfragment fragments_SpacerBlock on SpacerBlock {\n  size\n}\n\nfragment fragments_TextBlock on TextBlock {\n  text\n  variant\n}\n"
  }
};
})();

(node as any).hash = "2243bd3494c21f2b92198b31a12c56ae";

export default node;
