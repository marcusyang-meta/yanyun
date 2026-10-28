/**
 * @generated SignedSource<<2c9f29a2c09463811f517d4e7f10c84c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingDetailAllySharingMutation$variables = {
  allyVisible: boolean;
  groupingId: string;
  slug: string;
  visitorSlots: number;
};
export type GroupingDetailAllySharingMutation$data = {
  readonly setGroupingAllySharing: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GroupingDetailAllySharingMutation = {
  response: GroupingDetailAllySharingMutation$data;
  variables: GroupingDetailAllySharingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allyVisible"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "groupingId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "visitorSlots"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "allyVisible",
        "variableName": "allyVisible"
      },
      {
        "kind": "Variable",
        "name": "groupingId",
        "variableName": "groupingId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      },
      {
        "kind": "Variable",
        "name": "visitorSlots",
        "variableName": "visitorSlots"
      }
    ],
    "concreteType": "NetworkOkPayload",
    "kind": "LinkedField",
    "name": "setGroupingAllySharing",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GroupingDetailAllySharingMutation",
    "selections": (v4/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GroupingDetailAllySharingMutation",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "6f6691bed5dc7f5b6aa2f322c7d726fd",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailAllySharingMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailAllySharingMutation(\n  $slug: String!\n  $groupingId: ID!\n  $allyVisible: Boolean!\n  $visitorSlots: Int!\n) {\n  setGroupingAllySharing(slug: $slug, groupingId: $groupingId, allyVisible: $allyVisible, visitorSlots: $visitorSlots) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "001eb0cd4a03e76a1f6eac9f18811f93";

export default node;
