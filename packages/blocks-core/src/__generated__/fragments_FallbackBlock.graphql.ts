/**
 * @generated SignedSource<<6b7801d71072e7f8fefabfd5c48ce4bb>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_FallbackBlock$data = {
  readonly text: string;
  readonly " $fragmentType": "fragments_FallbackBlock";
};
export type fragments_FallbackBlock$key = {
  readonly " $data"?: fragments_FallbackBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_FallbackBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_FallbackBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    }
  ],
  "type": "FallbackBlock",
  "abstractKey": null
};

(node as any).hash = "84d4c119f3ad9c060f7e2b630653514f";

export default node;
