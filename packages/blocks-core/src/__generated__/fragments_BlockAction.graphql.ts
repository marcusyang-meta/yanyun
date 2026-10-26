/**
 * @generated SignedSource<<9e3301d12d06f335933c440a130f346c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_BlockAction$data = {
  readonly __typename: "CompleteAction";
  readonly cancelLabel: string;
  readonly confirmMessage: string;
  readonly confirmTitle: string;
  readonly groupingId: string;
  readonly okLabel: string;
  readonly " $fragmentType": "fragments_BlockAction";
} | {
  readonly __typename: "DisbandAction";
  readonly cancelLabel: string;
  readonly confirmMessage: string;
  readonly confirmTitle: string;
  readonly groupingId: string;
  readonly okLabel: string;
  readonly " $fragmentType": "fragments_BlockAction";
} | {
  readonly __typename: "EditAction";
  readonly groupingId: string;
  readonly " $fragmentType": "fragments_BlockAction";
} | {
  readonly __typename: "JoinAction";
  readonly groupingId: string;
  readonly seatIndex: number;
  readonly " $fragmentType": "fragments_BlockAction";
} | {
  readonly __typename: "LeaveAction";
  readonly cancelLabel: string;
  readonly confirmMessage: string;
  readonly confirmTitle: string;
  readonly groupingId: string;
  readonly okLabel: string;
  readonly uid: string;
  readonly " $fragmentType": "fragments_BlockAction";
} | {
  readonly __typename: "NavigateAction";
  readonly groupingId: string;
  readonly name: string;
  readonly nick: string;
  readonly readOnly: boolean;
  readonly slug: string;
  readonly " $fragmentType": "fragments_BlockAction";
} | {
  readonly __typename: "UncompleteAction";
  readonly groupingId: string;
  readonly " $fragmentType": "fragments_BlockAction";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "fragments_BlockAction";
};
export type fragments_BlockAction$key = {
  readonly " $data"?: fragments_BlockAction$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockAction">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "groupingId",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmTitle",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmMessage",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "okLabel",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cancelLabel",
  "storageKey": null
},
v5 = [
  (v0/*:: as any*/),
  (v1/*:: as any*/),
  (v2/*:: as any*/),
  (v3/*:: as any*/),
  (v4/*:: as any*/)
],
v6 = [
  (v0/*:: as any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_BlockAction",
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
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "slug",
          "storageKey": null
        },
        (v0/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "readOnly",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nick",
          "storageKey": null
        }
      ],
      "type": "NavigateAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "seatIndex",
          "storageKey": null
        }
      ],
      "type": "JoinAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uid",
          "storageKey": null
        },
        (v1/*:: as any*/),
        (v2/*:: as any*/),
        (v3/*:: as any*/),
        (v4/*:: as any*/)
      ],
      "type": "LeaveAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v5/*:: as any*/),
      "type": "DisbandAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v6/*:: as any*/),
      "type": "EditAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v5/*:: as any*/),
      "type": "CompleteAction",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v6/*:: as any*/),
      "type": "UncompleteAction",
      "abstractKey": null
    }
  ],
  "type": "Action",
  "abstractKey": "__isAction"
};
})();

(node as any).hash = "52242cc8199fb89046d83148ef382658";

export default node;
