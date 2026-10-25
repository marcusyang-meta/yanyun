/**
 * @generated SignedSource<<a461d8f6c760e87240a65ddf9c8f69fa>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_EmptyStateBlock$data = {
  readonly text: string;
  readonly " $fragmentType": "fragments_EmptyStateBlock";
};
export type fragments_EmptyStateBlock$key = {
  readonly " $data"?: fragments_EmptyStateBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_EmptyStateBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_EmptyStateBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    }
  ],
  "type": "EmptyStateBlock",
  "abstractKey": null
};

(node as any).hash = "cd5df51096000359549b328807adb74d";

export default node;
