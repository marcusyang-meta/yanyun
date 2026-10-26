/**
 * @generated SignedSource<<38d0f36f28a3dc5f33b664dbf0199a46>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GroupingTab = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
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
      readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockNode1Match">;
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
                "name": "fragments_BlockNode1Match"
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
              {
                "kind": "TypeDiscriminator",
                "abstractKey": "__isBlock"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_TextBlock",
                    "fragmentPropName": "TextBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "TextBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_BannerBlock",
                    "fragmentPropName": "BannerBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "BannerBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_SectionHeaderBlock",
                    "fragmentPropName": "SectionHeaderBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "SectionHeaderBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_ChipRowBlock",
                    "fragmentPropName": "ChipRowBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "ChipRowBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_GroupingCardBlock",
                    "fragmentPropName": "GroupingCardBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "GroupingCardBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_SeatGridBlock",
                    "fragmentPropName": "SeatGridBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "SeatGridBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_ActionButtonBlock",
                    "fragmentPropName": "ActionButtonBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "ActionButtonBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_EmptyStateBlock",
                    "fragmentPropName": "EmptyStateBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "EmptyStateBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_SpacerBlock",
                    "fragmentPropName": "SpacerBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "SpacerBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_FallbackBlock",
                    "fragmentPropName": "FallbackBlock",
                    "kind": "ModuleImport"
                  }
                ],
                "type": "FallbackBlock",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "fragments_BlockNode1Match",
                    "fragmentName": "fragments_SectionNode1",
                    "fragmentPropName": "SectionNode1",
                    "kind": "ModuleImport"
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
    "cacheID": "a39fcdafb8e0730cb27196b2db338b8d",
    "id": null,
    "metadata": {},
    "name": "documentsGroupingListBlocksQuery",
    "operationKind": "query",
    "text": "query documentsGroupingListBlocksQuery(\n  $slug: String!\n  $tab: GroupingTab!\n  $weekOffset: Int\n  $blocksVersion: Int\n) {\n  groupingListPage(slug: $slug, tab: $tab) {\n    blocks(blocksVersion: $blocksVersion, weekOffset: $weekOffset) {\n      __typename\n      ...fragments_BlockNode1Match\n    }\n  }\n}\n\nfragment fragments_ActionButtonBlock on ActionButtonBlock {\n  label\n  style\n  action {\n    __typename\n    ...fragments_BlockAction\n  }\n}\n\nfragment fragments_BannerBlock on BannerBlock {\n  text\n}\n\nfragment fragments_BlockAction on Action {\n  __isAction: __typename\n  __typename\n  ... on NavigateAction {\n    slug\n    groupingId\n    name\n    readOnly\n    nick\n  }\n  ... on JoinAction {\n    groupingId\n    seatIndex\n  }\n  ... on LeaveAction {\n    groupingId\n    uid\n    confirmTitle\n    confirmMessage\n    okLabel\n    cancelLabel\n  }\n  ... on DisbandAction {\n    groupingId\n    confirmTitle\n    confirmMessage\n    okLabel\n    cancelLabel\n  }\n  ... on EditAction {\n    groupingId\n  }\n  ... on CompleteAction {\n    groupingId\n    confirmTitle\n    confirmMessage\n    okLabel\n    cancelLabel\n  }\n  ... on UncompleteAction {\n    groupingId\n  }\n}\n\nfragment fragments_BlockLeafMatch on Block {\n  __isBlock: __typename\n  ... on TextBlock {\n    ...fragments_TextBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_TextBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"TextBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on BannerBlock {\n    ...fragments_BannerBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_BannerBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"BannerBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on SectionHeaderBlock {\n    ...fragments_SectionHeaderBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_SectionHeaderBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"SectionHeaderBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on ChipRowBlock {\n    ...fragments_ChipRowBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_ChipRowBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"ChipRowBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on GroupingCardBlock {\n    ...fragments_GroupingCardBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_GroupingCardBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"GroupingCardBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on SeatGridBlock {\n    ...fragments_SeatGridBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_SeatGridBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"SeatGridBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on ActionButtonBlock {\n    ...fragments_ActionButtonBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_ActionButtonBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"ActionButtonBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on EmptyStateBlock {\n    ...fragments_EmptyStateBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_EmptyStateBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"EmptyStateBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on SpacerBlock {\n    ...fragments_SpacerBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_SpacerBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"SpacerBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n  ... on FallbackBlock {\n    ...fragments_FallbackBlock\n    __module_operation_fragments_BlockLeafMatch: js(module: \"fragments_FallbackBlock$normalization.graphql\", id: \"fragments_BlockLeafMatch\")\n    __module_component_fragments_BlockLeafMatch: js(module: \"FallbackBlock\", id: \"fragments_BlockLeafMatch\")\n  }\n}\n\nfragment fragments_BlockNode1Match on Block {\n  __isBlock: __typename\n  ... on TextBlock {\n    ...fragments_TextBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_TextBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"TextBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on BannerBlock {\n    ...fragments_BannerBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_BannerBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"BannerBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on SectionHeaderBlock {\n    ...fragments_SectionHeaderBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_SectionHeaderBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"SectionHeaderBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on ChipRowBlock {\n    ...fragments_ChipRowBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_ChipRowBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"ChipRowBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on GroupingCardBlock {\n    ...fragments_GroupingCardBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_GroupingCardBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"GroupingCardBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on SeatGridBlock {\n    ...fragments_SeatGridBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_SeatGridBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"SeatGridBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on ActionButtonBlock {\n    ...fragments_ActionButtonBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_ActionButtonBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"ActionButtonBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on EmptyStateBlock {\n    ...fragments_EmptyStateBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_EmptyStateBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"EmptyStateBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on SpacerBlock {\n    ...fragments_SpacerBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_SpacerBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"SpacerBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on FallbackBlock {\n    ...fragments_FallbackBlock\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_FallbackBlock$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"FallbackBlock\", id: \"fragments_BlockNode1Match\")\n  }\n  ... on SectionBlock {\n    ...fragments_SectionNode1\n    __module_operation_fragments_BlockNode1Match: js(module: \"fragments_SectionNode1$normalization.graphql\", id: \"fragments_BlockNode1Match\")\n    __module_component_fragments_BlockNode1Match: js(module: \"SectionNode1\", id: \"fragments_BlockNode1Match\")\n  }\n}\n\nfragment fragments_BlockNode2Match on Block {\n  __isBlock: __typename\n  ... on TextBlock {\n    ...fragments_TextBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_TextBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"TextBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on BannerBlock {\n    ...fragments_BannerBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_BannerBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"BannerBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on SectionHeaderBlock {\n    ...fragments_SectionHeaderBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_SectionHeaderBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"SectionHeaderBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on ChipRowBlock {\n    ...fragments_ChipRowBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_ChipRowBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"ChipRowBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on GroupingCardBlock {\n    ...fragments_GroupingCardBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_GroupingCardBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"GroupingCardBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on SeatGridBlock {\n    ...fragments_SeatGridBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_SeatGridBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"SeatGridBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on ActionButtonBlock {\n    ...fragments_ActionButtonBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_ActionButtonBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"ActionButtonBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on EmptyStateBlock {\n    ...fragments_EmptyStateBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_EmptyStateBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"EmptyStateBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on SpacerBlock {\n    ...fragments_SpacerBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_SpacerBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"SpacerBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on FallbackBlock {\n    ...fragments_FallbackBlock\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_FallbackBlock$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"FallbackBlock\", id: \"fragments_BlockNode2Match\")\n  }\n  ... on SectionBlock {\n    ...fragments_SectionNode2\n    __module_operation_fragments_BlockNode2Match: js(module: \"fragments_SectionNode2$normalization.graphql\", id: \"fragments_BlockNode2Match\")\n    __module_component_fragments_BlockNode2Match: js(module: \"SectionNode2\", id: \"fragments_BlockNode2Match\")\n  }\n}\n\nfragment fragments_ChipRowBlock on ChipRowBlock {\n  chips\n}\n\nfragment fragments_EmptyStateBlock on EmptyStateBlock {\n  text\n}\n\nfragment fragments_FallbackBlock on FallbackBlock {\n  text\n}\n\nfragment fragments_GroupingCardBlock on GroupingCardBlock {\n  groupingId\n  cardTitle: title\n  badgeText\n  timeText\n  dungeonName\n  peopleText\n  statusText\n  action {\n    __typename\n    ...fragments_BlockAction\n  }\n}\n\nfragment fragments_SeatGridBlock on SeatGridBlock {\n  seats {\n    index\n    occupied\n    nickname\n    weapon\n    role\n    healer\n    action {\n      __typename\n      ...fragments_BlockAction\n    }\n  }\n}\n\nfragment fragments_SectionHeaderBlock on SectionHeaderBlock {\n  text\n}\n\nfragment fragments_SectionNode1 on SectionBlock {\n  title\n  children {\n    __typename\n    ...fragments_BlockNode2Match\n  }\n}\n\nfragment fragments_SectionNode2 on SectionBlock {\n  title\n  children {\n    __typename\n    ...fragments_BlockLeafMatch\n  }\n}\n\nfragment fragments_SpacerBlock on SpacerBlock {\n  size\n}\n\nfragment fragments_TextBlock on TextBlock {\n  text\n  variant\n}\n"
  }
};
})();

(node as any).hash = "01a9a2b33381b6a643d40dbe8e2cae95";

export default node;
