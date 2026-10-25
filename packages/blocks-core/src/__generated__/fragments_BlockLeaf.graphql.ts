/**
 * @generated SignedSource<<c69d1ba5bd01bb9aefc5f9b7bab8e8c7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_BlockLeaf$data = {
  readonly __typename: "ActionButtonBlock";
  readonly actionButtonBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_ActionButtonBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "BannerBlock";
  readonly bannerBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_BannerBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "ChipRowBlock";
  readonly chipRowBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_ChipRowBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "EmptyStateBlock";
  readonly emptyStateBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_EmptyStateBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "FallbackBlock";
  readonly fallbackBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_FallbackBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "GroupingCardBlock";
  readonly groupingCardBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_GroupingCardBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "SeatGridBlock";
  readonly seatGridBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_SeatGridBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "SectionHeaderBlock";
  readonly sectionHeaderBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_SectionHeaderBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "SpacerBlock";
  readonly spacerBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_SpacerBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  readonly __typename: "TextBlock";
  readonly textBlock: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_TextBlock">;
  } | null | undefined;
  readonly " $fragmentType": "fragments_BlockLeaf";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "fragments_BlockLeaf";
};
export type fragments_BlockLeaf$key = {
  readonly " $data"?: fragments_BlockLeaf$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockLeaf">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_BlockLeaf",
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
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_TextBlock"
              }
            ],
            "type": "TextBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "textBlock"
        }
      ],
      "type": "TextBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_BannerBlock"
              }
            ],
            "type": "BannerBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "bannerBlock"
        }
      ],
      "type": "BannerBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_SectionHeaderBlock"
              }
            ],
            "type": "SectionHeaderBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "sectionHeaderBlock"
        }
      ],
      "type": "SectionHeaderBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_ChipRowBlock"
              }
            ],
            "type": "ChipRowBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "chipRowBlock"
        }
      ],
      "type": "ChipRowBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_GroupingCardBlock"
              }
            ],
            "type": "GroupingCardBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "groupingCardBlock"
        }
      ],
      "type": "GroupingCardBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_SeatGridBlock"
              }
            ],
            "type": "SeatGridBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "seatGridBlock"
        }
      ],
      "type": "SeatGridBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_ActionButtonBlock"
              }
            ],
            "type": "ActionButtonBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "actionButtonBlock"
        }
      ],
      "type": "ActionButtonBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_EmptyStateBlock"
              }
            ],
            "type": "EmptyStateBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "emptyStateBlock"
        }
      ],
      "type": "EmptyStateBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_SpacerBlock"
              }
            ],
            "type": "SpacerBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "spacerBlock"
        }
      ],
      "type": "SpacerBlock",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "fragments_FallbackBlock"
              }
            ],
            "type": "FallbackBlock",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "fallbackBlock"
        }
      ],
      "type": "FallbackBlock",
      "abstractKey": null
    }
  ],
  "type": "Block",
  "abstractKey": "__isBlock"
};

(node as any).hash = "baaa62b57036d0e2ae17c5438233991c";

export default node;
