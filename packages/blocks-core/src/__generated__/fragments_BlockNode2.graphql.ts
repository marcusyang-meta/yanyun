/**
 * @generated SignedSource<<f9c13f0b31d55e364506d2e550c39365>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_BlockNode2$data = {
  readonly __typename: string;
  readonly children?: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockLeaf">;
  }>;
  readonly title?: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockLeaf">;
  readonly " $fragmentType": "fragments_BlockNode2";
};
export type fragments_BlockNode2$key = {
  readonly " $data"?: fragments_BlockNode2$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockNode2">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "fragments_BlockLeaf"
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_BlockNode2",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    (v0/*:: as any*/),
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
            (v0/*:: as any*/)
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
})();

(node as any).hash = "0f629626c5d32612e04e5171c2f4fab4";

export default node;
