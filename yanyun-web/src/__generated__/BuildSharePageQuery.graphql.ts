/**
 * @generated SignedSource<<6d7d1df3a77c3d92bf81a396dea8ca6e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BuildSharePageQuery$variables = {
  code: string;
};
export type BuildSharePageQuery$data = {
  readonly gradPage: {
    readonly gearAffixes: ReadonlyArray<{
      readonly cy: number;
      readonly key: string;
      readonly label: string;
      readonly max: number;
    }>;
    readonly gearGradLabel: string;
    readonly gearYAccLabel: string;
    readonly gearYCritLabel: string;
    readonly gearYIntLabel: string;
  };
  readonly sharedBuild: {
    readonly bowKind: string;
    readonly buildLabel: string | null | undefined;
    readonly buildShareKicker: string;
    readonly buildShareLoginLabel: string;
    readonly buildShareNotFoundBody: string;
    readonly buildShareNotFoundTitle: string;
    readonly buildShareXinfaLabel: string;
    readonly exists: boolean;
    readonly items: ReadonlyArray<{
      readonly dingyin: {
        readonly name: string;
        readonly val: number;
      } | null | undefined;
      readonly lines: ReadonlyArray<{
        readonly key: string;
        readonly val: number;
      }>;
      readonly name: string;
      readonly slot: string;
      readonly warnings: ReadonlyArray<string>;
    }>;
    readonly name: string | null | undefined;
    readonly school: string | null | undefined;
    readonly snapA: number;
    readonly snapB: number;
    readonly snapD: number;
    readonly snapLoan: number;
    readonly snapTotal: number;
    readonly snapYAcc: number;
    readonly snapYCrit: number;
    readonly snapYInt: number;
    readonly xinfa: ReadonlyArray<string>;
  };
};
export type BuildSharePageQuery = {
  response: BuildSharePageQuery$data;
  variables: BuildSharePageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "code"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "val",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "code",
        "variableName": "code"
      }
    ],
    "concreteType": "SharedBuildPage",
    "kind": "LinkedField",
    "name": "sharedBuild",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "exists",
        "storageKey": null
      },
      (v1/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "buildLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "school",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "xinfa",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "bowKind",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "snapTotal",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "snapA",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "snapB",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "snapD",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "snapLoan",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "snapYAcc",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "snapYCrit",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "snapYInt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "SharedBuildItem",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slot",
            "storageKey": null
          },
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "GearLine",
            "kind": "LinkedField",
            "name": "lines",
            "plural": true,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearDingyin",
            "kind": "LinkedField",
            "name": "dingyin",
            "plural": false,
            "selections": [
              (v1/*:: as any*/),
              (v3/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "warnings",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "buildShareKicker",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "buildShareLoginLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "buildShareNotFoundTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "buildShareNotFoundBody",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "buildShareXinfaLabel",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "GradPage",
    "kind": "LinkedField",
    "name": "gradPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearGradLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYAccLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYCritLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYIntLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearAffixRow",
        "kind": "LinkedField",
        "name": "gearAffixes",
        "plural": true,
        "selections": [
          (v2/*:: as any*/),
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
            "name": "max",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cy",
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
    "name": "BuildSharePageQuery",
    "selections": (v4/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "BuildSharePageQuery",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "4e7943601629fc6ab63793415676f79a",
    "id": null,
    "metadata": {},
    "name": "BuildSharePageQuery",
    "operationKind": "query",
    "text": "query BuildSharePageQuery(\n  $code: String!\n) {\n  sharedBuild(code: $code) {\n    exists\n    name\n    buildLabel\n    school\n    xinfa\n    bowKind\n    snapTotal\n    snapA\n    snapB\n    snapD\n    snapLoan\n    snapYAcc\n    snapYCrit\n    snapYInt\n    items {\n      slot\n      name\n      lines {\n        key\n        val\n      }\n      dingyin {\n        name\n        val\n      }\n      warnings\n    }\n    buildShareKicker\n    buildShareLoginLabel\n    buildShareNotFoundTitle\n    buildShareNotFoundBody\n    buildShareXinfaLabel\n  }\n  gradPage {\n    gearGradLabel\n    gearYAccLabel\n    gearYCritLabel\n    gearYIntLabel\n    gearAffixes {\n      key\n      label\n      max\n      cy\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "82a27440eb6f14c7c1337a6d8088fc5b";

export default node;
