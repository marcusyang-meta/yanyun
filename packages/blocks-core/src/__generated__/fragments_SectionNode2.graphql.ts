/**
 * @generated SignedSource<<ec92c170dea1ce7fe39017cf8c8783b7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_SectionNode2$data = {
  readonly children: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockLeafMatch">;
  }>;
  readonly title: string | null | undefined;
  readonly " $fragmentType": "fragments_SectionNode2";
};
export type fragments_SectionNode2$key = {
  readonly " $data"?: fragments_SectionNode2$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_SectionNode2">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_SectionNode2",
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
          "name": "fragments_BlockLeafMatch"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SectionBlock",
  "abstractKey": null
};

(node as any).hash = "e20cd4cb533e6cdadf277be4d7050924";

export default node;
