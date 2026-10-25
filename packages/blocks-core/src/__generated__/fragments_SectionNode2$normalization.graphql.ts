/**
 * @generated SignedSource<<64eb75486d3f45c2531601c7969e9028>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { NormalizationSplitOperation } from 'relay-runtime';


const node: NormalizationSplitOperation = {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "fragments_SectionNode2$normalization",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "children",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
          "kind": "TypeDiscriminator",
          "abstractKey": "__isBlock"
        },
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
      "storageKey": null
    }
  ]
};

(node as any).hash = "e20cd4cb533e6cdadf277be4d7050924";

export default node;
