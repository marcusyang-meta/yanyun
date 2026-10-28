import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOperationDescriptor, fetchQuery, getRequest } from 'relay-runtime';
import { relayEnvironment } from './relay';
import { GroupingListBlocksQuery } from './documents';
import type { documentsGroupingListBlocksQuery } from './__generated__/documentsGroupingListBlocksQuery.graphql';

// Regression test for the 2026-10-28 production crash: re-entering a
// grouping tab (ACTIVITY / TALENT / RACE / TOWER) whose block tree was
// already in the Relay store crashed into the AsyncBoundary error state
// ("Minified exception occurred..." in production builds). Root cause:
// src/relay.ts passed operationLoader only to the Environment, not to
// the hand-built Store, so store.check() -- which fetchQuery runs on the
// store-or-network path before serving cached data -- walked the blocks'
// @module selections with a null loader and DataChecker threw
// "Expected an operationLoader to be configured when using `@module`."
// Cold entries never crashed (no cached data -> check() reports missing
// before reaching the @module selections), which is why only warm
// re-entry (tab switch back, live refresh, foreground resync) hit it.
//
// The payload below is a real RACE-tab response captured from the
// backend (banner + day header + two grouping cards, each carrying its
// @module operation/component references exactly as served).

const VARIABLES = { slug: 'rigtest', tab: 'RACE', weekOffset: 0, blocksVersion: 4 } as const;

const RACE_BLOCKS_PAYLOAD = {
  data: {
    groupingListPage: {
      blocks: [
        {
          __typename: 'BannerBlock',
          __isBlock: 'BannerBlock',
          text: '本周六晚八点百业竞速夜',
          __module_operation_fragments_BlockNode1Match: 'fragments_BannerBlock$normalization.graphql',
          __module_component_fragments_BlockNode1Match: 'BannerBlock',
        },
        {
          __typename: 'SectionHeaderBlock',
          __isBlock: 'SectionHeaderBlock',
          text: '10月27日 周二',
          __module_operation_fragments_BlockNode1Match: 'fragments_SectionHeaderBlock$normalization.graphql',
          __module_component_fragments_BlockNode1Match: 'SectionHeaderBlock',
        },
        {
          __typename: 'GroupingCardBlock',
          __isBlock: 'GroupingCardBlock',
          groupingId: '8',
          cardTitle: 'Past race yesterday',
          badgeText: '竞速',
          timeText: '10/27周二 20:00',
          dungeonName: 'RigDungeon',
          peopleText: '0/20 人',
          statusText: '报名中',
          action: {
            __typename: 'NavigateAction',
            __isAction: 'NavigateAction',
            slug: 'rigtest',
            groupingId: '8',
            name: 'RigTestGuild',
            nick: '',
          },
          __module_operation_fragments_BlockNode1Match: 'fragments_GroupingCardBlock$normalization.graphql',
          __module_component_fragments_BlockNode1Match: 'GroupingCardBlock',
        },
        {
          __typename: 'GroupingCardBlock',
          __isBlock: 'GroupingCardBlock',
          groupingId: '1',
          cardTitle: 'Race plain',
          badgeText: '竞速',
          timeText: '10/28周三 18:34',
          dungeonName: 'RigDungeon',
          peopleText: '1/5 人',
          statusText: '报名中',
          action: {
            __typename: 'NavigateAction',
            __isAction: 'NavigateAction',
            slug: 'rigtest',
            groupingId: '1',
            name: 'RigTestGuild',
            nick: '',
          },
          __module_operation_fragments_BlockNode1Match: 'fragments_GroupingCardBlock$normalization.graphql',
          __module_component_fragments_BlockNode1Match: 'GroupingCardBlock',
        },
      ],
    },
  },
};

describe('relayEnvironment store wiring', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => RACE_BLOCKS_PAYLOAD,
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serves a warm @module block tree on re-check without throwing', async () => {
    // Cold entry: fetch the RACE tab's block tree into the store.
    const cold = await fetchQuery<documentsGroupingListBlocksQuery>(relayEnvironment, GroupingListBlocksQuery, VARIABLES, {
      fetchPolicy: 'network-only',
    }).toPromise();
    expect(cold?.groupingListPage?.blocks).toHaveLength(4);

    // Warm re-entry: store.check() walks the cached @module selections.
    // With the Store missing its operationLoader this throws the
    // DataChecker @module invariant -- the production crash.
    const operation = createOperationDescriptor(getRequest(GroupingListBlocksQuery), VARIABLES);
    let checkResult: ReturnType<typeof relayEnvironment.check> | undefined;
    expect(() => {
      checkResult = relayEnvironment.check(operation);
    }).not.toThrow();
    expect(checkResult?.status).toBe('available');

    // The full store-or-network path (what useLazyLoadQuery runs when a
    // tab is re-entered) resolves from the warm store and returns the
    // grouping cards.
    const warm = await fetchQuery<documentsGroupingListBlocksQuery>(relayEnvironment, GroupingListBlocksQuery, VARIABLES, {
      fetchPolicy: 'store-or-network',
    }).toPromise();
    const blocks = warm?.groupingListPage?.blocks ?? [];
    expect(blocks.map((b) => b.__typename)).toEqual([
      'BannerBlock',
      'SectionHeaderBlock',
      'GroupingCardBlock',
      'GroupingCardBlock',
    ]);
  });
});
