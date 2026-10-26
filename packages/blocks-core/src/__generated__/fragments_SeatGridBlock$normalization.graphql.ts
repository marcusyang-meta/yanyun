/**
 * @generated SignedSource<<f18632cbde03c2f36bc7f384050af460>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { NormalizationSplitOperation } from 'relay-runtime';


const node: NormalizationSplitOperation = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ready",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "groupingId",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmTitle",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmMessage",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "okLabel",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cancelLabel",
  "storageKey": null
},
v6 = [
  (v1/*:: as any*/),
  (v2/*:: as any*/),
  (v3/*:: as any*/),
  (v4/*:: as any*/),
  (v5/*:: as any*/)
],
v7 = [
  (v1/*:: as any*/)
],
v8 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "__typename",
    "storageKey": null
  },
  {
    "kind": "TypeDiscriminator",
    "abstractKey": "__isAction"
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
      (v1/*:: as any*/),
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
      (v1/*:: as any*/),
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
      (v1/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "uid",
        "storageKey": null
      },
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/)
    ],
    "type": "LeaveAction",
    "abstractKey": null
  },
  {
    "kind": "InlineFragment",
    "selections": (v6/*:: as any*/),
    "type": "DisbandAction",
    "abstractKey": null
  },
  {
    "kind": "InlineFragment",
    "selections": (v7/*:: as any*/),
    "type": "EditAction",
    "abstractKey": null
  },
  {
    "kind": "InlineFragment",
    "selections": (v6/*:: as any*/),
    "type": "CompleteAction",
    "abstractKey": null
  },
  {
    "kind": "InlineFragment",
    "selections": (v7/*:: as any*/),
    "type": "UncompleteAction",
    "abstractKey": null
  },
  {
    "kind": "InlineFragment",
    "selections": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "type": "SetReadyAction",
    "abstractKey": null
  }
];
return {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "fragments_SeatGridBlock$normalization",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "SeatEntry",
      "kind": "LinkedField",
      "name": "seats",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "index",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "occupied",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nickname",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "weapon",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "role",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "healer",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isLeader",
          "storageKey": null
        },
        (v0/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "readyAction",
          "plural": false,
          "selections": (v8/*:: as any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "action",
          "plural": false,
          "selections": (v8/*:: as any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ]
};
})();

(node as any).hash = "6eb94950cd4bb51c09dd0410dabd9ccd";

export default node;
