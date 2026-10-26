/**
 * @generated SignedSource<<bf393c4ec64c9ae3942b61dcb8f3fdbe>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SectDetailQuery$variables = Record<PropertyKey, never>;
export type SectDetailQuery$data = {
  readonly sectPage: {
    readonly sectAffixBowLabel: string;
    readonly sectAffixColAffixLabel: string;
    readonly sectAffixColCountLabel: string;
    readonly sectAffixColCyLabel: string;
    readonly sectAffixColMaxLabel: string;
    readonly sectAffixDingyinLabel: string;
    readonly sectAffixEmptyText: string;
    readonly sectAffixSetLabel: string;
    readonly sectAffixSourceText: string;
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
    readonly sectTabAffixLabel: string;
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
      readonly gradBuilds: ReadonlyArray<{
        readonly bowLabel: string | null | undefined;
        readonly cat: string;
        readonly dingyinName: string | null | undefined;
        readonly name: string;
        readonly note: string | null | undefined;
        readonly recipe: string;
        readonly setName: string;
        readonly targets: ReadonlyArray<{
          readonly count: number;
          readonly cyValue: number | null | undefined;
          readonly flexLabels: ReadonlyArray<string>;
          readonly label: string;
          readonly maxValue: number | null | undefined;
          readonly unit: string;
        }>;
        readonly totalBars: number;
      }>;
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
export type SectDetailQuery = {
  response: SectDetailQuery$data;
  variables: SectDetailQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "note",
  "storageKey": null
},
v2 = [
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
        "kind": "ScalarField",
        "name": "sectTabAffixLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixSetLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixBowLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixDingyinLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixColAffixLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixColCountLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixColMaxLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixColCyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sectAffixSourceText",
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
          (v0/*:: as any*/),
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
              (v1/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "SectGradBuild",
            "kind": "LinkedField",
            "name": "gradBuilds",
            "plural": true,
            "selections": [
              (v0/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cat",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "setName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bowLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recipe",
                "storageKey": null
              },
              (v1/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dingyinName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "totalBars",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "SectGradTarget",
                "kind": "LinkedField",
                "name": "targets",
                "plural": true,
                "selections": [
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
                    "name": "count",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxValue",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cyValue",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "unit",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "flexLabels",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SectDetailQuery",
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SectDetailQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "5016db5b9f11f48a8807a90b2ad3dc11",
    "id": null,
    "metadata": {},
    "name": "SectDetailQuery",
    "operationKind": "query",
    "text": "query SectDetailQuery {\n  sectPage {\n    sectEmptyText\n    sectBackLabel\n    sectTabBisLabel\n    sectTabRotationLabel\n    sectTabRatesLabel\n    sectTabTiaolvLabel\n    sectTabGradLabel\n    sectNoBisText\n    sectNoRotationText\n    sectNoRatesText\n    sectRotGreydustLabel\n    sectRotOpenerLabel\n    sectRotLoopLabel\n    sectRotKeyPointsLabel\n    sectRotInnerSkillsLabel\n    sectRotVideoLabel\n    sectRateAccuracyLabel\n    sectRateCritLabel\n    sectRateCritDamageLabel\n    sectBisMainWeaponLabel\n    sectBisOffWeaponLabel\n    sectBisAccessoriesLabel\n    sectBisHeadBodyLabel\n    sectBisLegsWristsLabel\n    sectTabAffixLabel\n    sectAffixEmptyText\n    sectAffixSetLabel\n    sectAffixBowLabel\n    sectAffixDingyinLabel\n    sectAffixColAffixLabel\n    sectAffixColCountLabel\n    sectAffixColMaxLabel\n    sectAffixColCyLabel\n    sectAffixSourceText\n    sects {\n      slug\n      name\n      weapons\n      buildType\n      bis {\n        mainWeapon\n        offWeapon\n        accessories\n        headBody\n        legsWrists\n      }\n      rotation {\n        greydust\n        opener\n        loop\n        keyPoints\n        innerSkills\n        videoUrl\n      }\n      rateTargets {\n        accuracy\n        crit\n        critDamage\n        note\n      }\n      gradBuilds {\n        name\n        cat\n        setName\n        bowLabel\n        recipe\n        note\n        dingyinName\n        totalBars\n        targets {\n          label\n          count\n          maxValue\n          cyValue\n          unit\n          flexLabels\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9694e8c046736ae93d3b84e7e7865db4";

export default node;
