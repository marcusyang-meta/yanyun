/**
 * @generated SignedSource<<5155428c86f2d9c87037802e0062b045>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_ActionButtonBlock$data = {
  readonly action: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockAction">;
  } | null | undefined;
  readonly label: string;
  readonly style: string;
  readonly " $fragmentType": "fragments_ActionButtonBlock";
};
export type fragments_ActionButtonBlock$key = {
  readonly " $data"?: fragments_ActionButtonBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_ActionButtonBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_ActionButtonBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "label",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "style",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "action",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "fragments_BlockAction"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ActionButtonBlock",
  "abstractKey": null
};

(node as any).hash = "ab787214f1d5351d95a561ff5a1df590";

export default node;
