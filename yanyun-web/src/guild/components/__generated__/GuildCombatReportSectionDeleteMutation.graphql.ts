/**
 * @generated SignedSource<<6e07f3c74111d2c9d7301a7719fbe0a9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildCombatReportSectionDeleteMutation$variables = {
  id: string;
};
export type GuildCombatReportSectionDeleteMutation$data = {
  readonly deleteCombatEncounter: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildCombatReportSectionDeleteMutation = {
  response: GuildCombatReportSectionDeleteMutation$data;
  variables: GuildCombatReportSectionDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "CombatReportPayload",
    "kind": "LinkedField",
    "name": "deleteCombatEncounter",
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildCombatReportSectionDeleteMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildCombatReportSectionDeleteMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "36387a2da8b11ab9feca4b8696153ee2",
    "id": null,
    "metadata": {},
    "name": "GuildCombatReportSectionDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation GuildCombatReportSectionDeleteMutation(\n  $id: ID!\n) {\n  deleteCombatEncounter(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "53cf466ea8e155b361a18949a5042508";

export default node;
