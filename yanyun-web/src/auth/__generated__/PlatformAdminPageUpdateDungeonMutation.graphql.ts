/**
 * @generated SignedSource<<adfb49aa24dad3299ac849d969701e9a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageUpdateDungeonMutation$variables = {
  id: number;
  isCurrent?: boolean | null | undefined;
  videoTitle?: string | null | undefined;
  videoUrl?: string | null | undefined;
};
export type PlatformAdminPageUpdateDungeonMutation$data = {
  readonly platformAdminUpdateDungeon: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageUpdateDungeonMutation = {
  response: PlatformAdminPageUpdateDungeonMutation$data;
  variables: PlatformAdminPageUpdateDungeonMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isCurrent"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "videoTitle"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "videoUrl"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "isCurrent",
        "variableName": "isCurrent"
      },
      {
        "kind": "Variable",
        "name": "videoTitle",
        "variableName": "videoTitle"
      },
      {
        "kind": "Variable",
        "name": "videoUrl",
        "variableName": "videoUrl"
      }
    ],
    "concreteType": "PlatformAdminPayload",
    "kind": "LinkedField",
    "name": "platformAdminUpdateDungeon",
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
    "name": "PlatformAdminPageUpdateDungeonMutation",
    "selections": (v4/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v3/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "PlatformAdminPageUpdateDungeonMutation",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "82b27e06837c62cf93c976a723988f9f",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageUpdateDungeonMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageUpdateDungeonMutation(\n  $id: Int!\n  $isCurrent: Boolean\n  $videoUrl: String\n  $videoTitle: String\n) {\n  platformAdminUpdateDungeon(id: $id, isCurrent: $isCurrent, videoUrl: $videoUrl, videoTitle: $videoTitle) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "bc8e66e09110c0e5affd94f129bc0478";

export default node;
