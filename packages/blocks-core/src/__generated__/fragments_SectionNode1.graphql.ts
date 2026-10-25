/**
 * @generated SignedSource<<5bb8618036537f6323f0268be784f6f6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_SectionNode1$data = {
  readonly children: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockNode2Match">;
  }>;
  readonly title: string | null | undefined;
  readonly " $fragmentType": "fragments_SectionNode1";
};
export type fragments_SectionNode1$key = {
  readonly " $data"?: fragments_SectionNode1$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_SectionNode1">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_SectionNode1",
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
          "name": "fragments_BlockNode2Match"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SectionBlock",
  "abstractKey": null
};

(node as any).hash = "30b33196e4b5fd367b1f8ae21d1e6e54";

export default node;
