/**
 * @generated SignedSource<<a90f2d9972f624cb1eb5a8cfc5e0d060>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAlliesRespondMutation$variables = {
  accept: boolean;
  allianceId: string;
  slug: string;
};
export type GuildAlliesRespondMutation$data = {
  readonly respondAlliance: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAlliesRespondMutation = {
  response: GuildAlliesRespondMutation$data;
  variables: GuildAlliesRespondMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "accept"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allianceId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "accept",
        "variableName": "accept"
      },
      {
        "kind": "Variable",
        "name": "allianceId",
        "variableName": "allianceId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "AlliancePayload",
    "kind": "LinkedField",
    "name": "respondAlliance",
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
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAlliesRespondMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAlliesRespondMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "037a385c6d992c8177f456192bc096eb",
    "id": null,
    "metadata": {},
    "name": "GuildAlliesRespondMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAlliesRespondMutation(\n  $slug: String!\n  $allianceId: ID!\n  $accept: Boolean!\n) {\n  respondAlliance(slug: $slug, allianceId: $allianceId, accept: $accept) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "5ca421b6fee953df96c1c36922c6601a";

export default node;
