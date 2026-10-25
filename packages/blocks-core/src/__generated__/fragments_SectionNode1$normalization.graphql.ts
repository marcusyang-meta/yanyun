/**
 * @generated SignedSource<<d19940f2284d47258bec0c6cdb73992e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { NormalizationSplitOperation } from 'relay-runtime';


const node: NormalizationSplitOperation = {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "fragments_SectionNode1$normalization",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
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
              "documentName": "fragments_BlockNode2Match",
              "fragmentName": "fragments_SectionNode2",
              "fragmentPropName": "SectionNode2",
              "kind": "ModuleImport"
            }
          ],
          "type": "SectionBlock",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ]
};

(node as any).hash = "30b33196e4b5fd367b1f8ae21d1e6e54";

export default node;
