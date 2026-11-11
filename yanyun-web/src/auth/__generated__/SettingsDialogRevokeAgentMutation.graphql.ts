/**
 * @generated SignedSource<<74e52ba03a898901b2ca4a9901b4ed22>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogRevokeAgentMutation$variables = {
  id: string;
};
export type SettingsDialogRevokeAgentMutation$data = {
  readonly revokeAgentGrant: {
    readonly agentGrants: {
      readonly agentEmptyText: string;
      readonly agentHintText: string;
      readonly agentRevokeDoneText: string;
      readonly agentSectionTitle: string;
      readonly grants: ReadonlyArray<{
        readonly clientName: string;
        readonly createdText: string;
        readonly id: string;
        readonly lastUsedText: string;
        readonly name: string;
        readonly revokeLabel: string;
        readonly scopesLabel: string;
        readonly sourceLabel: string;
        readonly tokenPrefix: string;
      }>;
    } | null | undefined;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogRevokeAgentMutation = {
  response: SettingsDialogRevokeAgentMutation$data;
  variables: SettingsDialogRevokeAgentMutation$variables;
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
    "concreteType": "RevokeAgentGrantPayload",
    "kind": "LinkedField",
    "name": "revokeAgentGrant",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "errorCode",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "AgentGrantsSettings",
        "kind": "LinkedField",
        "name": "agentGrants",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "agentSectionTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "agentHintText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "agentEmptyText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "agentRevokeDoneText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "AgentGrant",
            "kind": "LinkedField",
            "name": "grants",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "clientName",
                "storageKey": null
              },
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
                "name": "scopesLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "sourceLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tokenPrefix",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "createdText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lastUsedText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "revokeLabel",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
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
    "name": "SettingsDialogRevokeAgentMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SettingsDialogRevokeAgentMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "d61f6d1f08b8cfeb9140fba436269ca2",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogRevokeAgentMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogRevokeAgentMutation(\n  $id: ID!\n) {\n  revokeAgentGrant(id: $id) {\n    ok\n    error\n    errorCode\n    agentGrants {\n      agentSectionTitle\n      agentHintText\n      agentEmptyText\n      agentRevokeDoneText\n      grants {\n        id\n        clientName\n        name\n        scopesLabel\n        sourceLabel\n        tokenPrefix\n        createdText\n        lastUsedText\n        revokeLabel\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "22471f586f8acd9644b7f655b6b44dda";

export default node;
