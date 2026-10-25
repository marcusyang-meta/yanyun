/**
 * @generated SignedSource<<52e7a7a7226458d27909af0e68aa915b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_BlockNode1$data = {
  readonly __typename: string;
  readonly children?: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockNode2">;
  }>;
  readonly title?: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockLeaf">;
  readonly " $fragmentType": "fragments_BlockNode1";
};
export type fragments_BlockNode1$key = {
  readonly " $data"?: fragments_BlockNode1$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockNode1">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_BlockNode1",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "fragments_BlockLeaf"
    },
    {
      "kind": "InlineFragment",
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
              "args": null,
              "kind": "FragmentSpread",
              "name": "fragments_BlockNode2"
            }
          ],
          "storageKey": null
        }
      ],
      "type": "SectionBlock",
      "abstractKey": null
    }
  ],
  "type": "Block",
  "abstractKey": "__isBlock"
};

(node as any).hash = "8f28dc104076aba3f9b2680f77b3f02d";

export default node;
