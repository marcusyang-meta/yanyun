/**
 * @generated SignedSource<<a1d37fc798031519135d9aa892112ca2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsSectPageQuery$variables = Record<PropertyKey, never>;
export type documentsSectPageQuery$data = {
  readonly sectPage: {
    readonly sectBackLabel: string;
    readonly sectBisAccessoriesLabel: string;
    readonly sectBisHeadBodyLabel: string;
    readonly sectBisLegsWristsLabel: string;
    readonly sectBisMainWeaponLabel: string;
    readonly sectBisOffWeaponLabel: string;
    readonly sectEmptyText: string;
    readonly sectNoBisText: string;
    readonly sectNoRatesText: string;
    readonly sectNoRotationText: string;
    readonly sectRateAccuracyLabel: string;
    readonly sectRateCritDamageLabel: string;
    readonly sectRateCritLabel: string;
    readonly sectRotGreydustLabel: string;
    readonly sectRotInnerSkillsLabel: string;
    readonly sectRotKeyPointsLabel: string;
    readonly sectRotLoopLabel: string;
    readonly sectRotOpenerLabel: string;
    readonly sectRotVideoLabel: string;
    readonly sectTabBisLabel: string;
    readonly sectTabGradLabel: string;
    readonly sectTabRatesLabel: string;
    readonly sectTabRotationLabel: string;
    readonly sectTabTiaolvLabel: string;
    readonly sects: ReadonlyArray<{
      readonly bis: {
        readonly accessories: ReadonlyArray<string>;
        readonly headBody: ReadonlyArray<string>;
        readonly legsWrists: ReadonlyArray<string>;
        readonly mainWeapon: ReadonlyArray<string>;
        readonly offWeapon: ReadonlyArray<string>;
      } | null | undefined;
      readonly buildType: string;
      readonly name: string;
      readonly rateTargets: {
        readonly accuracy: string | null | undefined;
        readonly crit: string | null | undefined;
        readonly critDamage: string | null | undefined;
        readonly note: string | null | undefined;
      } | null | undefined;
      readonly rotation: {
        readonly greydust: string | null | undefined;
        readonly innerSkills: string | null | undefined;
        readonly keyPoints: string | null | undefined;
        readonly loop: string | null | undefined;
        readonly opener: string | null | undefined;
        readonly videoUrl: string | null | undefined;
      } | null | undefined;
      readonly slug: string;
      readonly weapons: string;
    }>;
  };
};
export type documentsSectPageQuery = {
  response: documentsSectPageQuery$data;
  variables: documentsSectPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "SectPage",
    "kind": "LinkedField",
    "name": "sectPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectBackLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectTabBisLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectTabRotationLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectTabRatesLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectTabTiaolvLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectTabGradLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectNoBisText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectNoRotationText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectNoRatesText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRotGreydustLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRotOpenerLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRotLoopLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRotKeyPointsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRotInnerSkillsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRotVideoLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRateAccuracyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRateCritLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectRateCritDamageLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectBisMainWeaponLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectBisOffWeaponLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectBisAccessoriesLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectBisHeadBodyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectBisLegsWristsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Sect",
        "kind": "LinkedField",
        "name": "sects",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slug",
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
            "name": "weapons",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "buildType",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "BisTable",
            "kind": "LinkedField",
            "name": "bis",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "mainWeapon",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "offWeapon",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "accessories",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "headBody",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "legsWrists",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Rotation",
            "kind": "LinkedField",
            "name": "rotation",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "greydust",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "opener",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "loop",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "keyPoints",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "innerSkills",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "videoUrl",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "RateTargets",
            "kind": "LinkedField",
            "name": "rateTargets",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "accuracy",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "crit",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "critDamage",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "note",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsSectPageQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsSectPageQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "9063b954c621d99fca7e525290e1d541",
    "id": null,
    "metadata": {},
    "name": "documentsSectPageQuery",
    "operationKind": "query",
    "text": "query documentsSectPageQuery {\n  sectPage {\n    sectEmptyText\n    sectBackLabel\n    sectTabBisLabel\n    sectTabRotationLabel\n    sectTabRatesLabel\n    sectTabTiaolvLabel\n    sectTabGradLabel\n    sectNoBisText\n    sectNoRotationText\n    sectNoRatesText\n    sectRotGreydustLabel\n    sectRotOpenerLabel\n    sectRotLoopLabel\n    sectRotKeyPointsLabel\n    sectRotInnerSkillsLabel\n    sectRotVideoLabel\n    sectRateAccuracyLabel\n    sectRateCritLabel\n    sectRateCritDamageLabel\n    sectBisMainWeaponLabel\n    sectBisOffWeaponLabel\n    sectBisAccessoriesLabel\n    sectBisHeadBodyLabel\n    sectBisLegsWristsLabel\n    sects {\n      slug\n      name\n      weapons\n      buildType\n      bis {\n        mainWeapon\n        offWeapon\n        accessories\n        headBody\n        legsWrists\n      }\n      rotation {\n        greydust\n        opener\n        loop\n        keyPoints\n        innerSkills\n        videoUrl\n      }\n      rateTargets {\n        accuracy\n        crit\n        critDamage\n        note\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6de71c6e2a5dececad1eb2065c49515e";

export default node;
