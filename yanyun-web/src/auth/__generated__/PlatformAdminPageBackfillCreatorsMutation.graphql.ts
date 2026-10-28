/**
 * @generated SignedSource<<73c38cc5b7c8adeb48393f7d206cb626>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageBackfillCreatorsMutation$variables = {
  dryRun: boolean;
};
export type PlatformAdminPageBackfillCreatorsMutation$data = {
  readonly platformAdminBackfillCreators: {
    readonly alreadyStamped: number;
    readonly ambiguous: number;
    readonly backfilled: number;
    readonly considered: number;
    readonly dryRun: boolean;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly events: number;
    readonly noMatch: number;
    readonly ok: boolean;
    readonly placeholder: number;
  };
};
export type PlatformAdminPageBackfillCreatorsMutation = {
  response: PlatformAdminPageBackfillCreatorsMutation$data;
  variables: PlatformAdminPageBackfillCreatorsMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "dryRun"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "dryRun",
        "variableName": "dryRun"
      }
    ],
    "concreteType": "PlatformCreatorBackfillPayload",
    "kind": "LinkedField",
    "name": "platformAdminBackfillCreators",
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
        "kind": "ScalarField",
        "name": "dryRun",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "events",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "alreadyStamped",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "considered",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "backfilled",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "placeholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "noMatch",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ambiguous",
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
    "name": "PlatformAdminPageBackfillCreatorsMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageBackfillCreatorsMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "2d77849a4b9067ca0db3464955b19c44",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageBackfillCreatorsMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageBackfillCreatorsMutation(\n  $dryRun: Boolean!\n) {\n  platformAdminBackfillCreators(dryRun: $dryRun) {\n    ok\n    error\n    errorCode\n    dryRun\n    events\n    alreadyStamped\n    considered\n    backfilled\n    placeholder\n    noMatch\n    ambiguous\n  }\n}\n"
  }
};
})();

(node as any).hash = "66bb735143b05f092f5e592af7ec53e0";

export default node;
