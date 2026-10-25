/**
 * @generated SignedSource<<09e230ccc05fa52ce5d2746bceb6fef6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_TextBlock$data = {
  readonly text: string;
  readonly variant: string;
  readonly " $fragmentType": "fragments_TextBlock";
};
export type fragments_TextBlock$key = {
  readonly " $data"?: fragments_TextBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_TextBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_TextBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    },
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
};

(node as any).hash = "23681fba8ef014da40bde0d401e145a1";

export default node;
