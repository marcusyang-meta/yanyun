/**
 * @generated SignedSource<<8eeec6849f8e6e9601f033f8ac032f19>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AvailabilitySlotInput = {
  endMinute: number;
  startMinute: number;
  weekday: number;
};
export type GuildMarketPublishOfferMutation$variables = {
  note?: string | null | undefined;
  school: string;
  slug: string;
  windows: ReadonlyArray<AvailabilitySlotInput>;
};
export type GuildMarketPublishOfferMutation$data = {
  readonly publishFillOffer: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildMarketPublishOfferMutation = {
  response: GuildMarketPublishOfferMutation$data;
  variables: GuildMarketPublishOfferMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "note"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "school"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "windows"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "note",
        "variableName": "note"
      },
      {
        "kind": "Variable",
        "name": "school",
        "variableName": "school"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      },
      {
        "kind": "Variable",
        "name": "windows",
        "variableName": "windows"
      }
    ],
    "concreteType": "FillOfferPayload",
    "kind": "LinkedField",
    "name": "publishFillOffer",
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
    "name": "GuildMarketPublishOfferMutation",
    "selections": (v4/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v3/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildMarketPublishOfferMutation",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "6b3d7ead6814002fb8d8f3ba4b894e08",
    "id": null,
    "metadata": {},
    "name": "GuildMarketPublishOfferMutation",
    "operationKind": "mutation",
    "text": "mutation GuildMarketPublishOfferMutation(\n  $slug: String!\n  $school: String!\n  $windows: [AvailabilitySlotInput!]!\n  $note: String\n) {\n  publishFillOffer(slug: $slug, school: $school, windows: $windows, note: $note) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "82f5e4b552904ed7a14f628b11d5e59d";

export default node;
