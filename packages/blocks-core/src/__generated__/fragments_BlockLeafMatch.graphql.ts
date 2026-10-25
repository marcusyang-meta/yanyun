/**
 * @generated SignedSource<<f134b85f84ae566cdbfd693d73d717bd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @dataDrivenDependency fragments_BlockLeafMatch {"branches":{"ActionButtonBlock":{"component":"ActionButtonBlock","fragment":"fragments_ActionButtonBlock$normalization.graphql"},"BannerBlock":{"component":"BannerBlock","fragment":"fragments_BannerBlock$normalization.graphql"},"ChipRowBlock":{"component":"ChipRowBlock","fragment":"fragments_ChipRowBlock$normalization.graphql"},"EmptyStateBlock":{"component":"EmptyStateBlock","fragment":"fragments_EmptyStateBlock$normalization.graphql"},"FallbackBlock":{"component":"FallbackBlock","fragment":"fragments_FallbackBlock$normalization.graphql"},"GroupingCardBlock":{"component":"GroupingCardBlock","fragment":"fragments_GroupingCardBlock$normalization.graphql"},"SeatGridBlock":{"component":"SeatGridBlock","fragment":"fragments_SeatGridBlock$normalization.graphql"},"SectionHeaderBlock":{"component":"SectionHeaderBlock","fragment":"fragments_SectionHeaderBlock$normalization.graphql"},"SpacerBlock":{"component":"SpacerBlock","fragment":"fragments_SpacerBlock$normalization.graphql"},"TextBlock":{"component":"TextBlock","fragment":"fragments_TextBlock$normalization.graphql"}},"plural":false}

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_BlockLeafMatch$data = {
  readonly __fragmentPropName?: string | null | undefined;
  readonly __module_component?: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_ActionButtonBlock" | "fragments_BannerBlock" | "fragments_ChipRowBlock" | "fragments_EmptyStateBlock" | "fragments_FallbackBlock" | "fragments_GroupingCardBlock" | "fragments_SeatGridBlock" | "fragments_SectionHeaderBlock" | "fragments_SpacerBlock" | "fragments_TextBlock">;
  readonly " $fragmentType": "fragments_BlockLeafMatch";
};
export type fragments_BlockLeafMatch$key = {
  readonly " $data"?: fragments_BlockLeafMatch$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockLeafMatch">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_BlockLeafMatch",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "args": null,
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
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
          "documentName": "fragments_BlockLeafMatch",
          "fragmentName": "fragments_FallbackBlock",
          "fragmentPropName": "FallbackBlock",
          "kind": "ModuleImport"
        }
      ],
      "type": "FallbackBlock",
      "abstractKey": null
    }
  ],
  "type": "Block",
  "abstractKey": "__isBlock"
};

(node as any).hash = "2ed754d39bac00a7898e9159b9254bbe";

export default node;
