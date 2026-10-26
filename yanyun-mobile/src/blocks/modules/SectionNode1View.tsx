import React from 'react';
import { useFragment } from 'react-relay';
import { SectionNode1Fragment } from '../fragments';
import type { ActionHandlers, fragments_SectionNode1$key } from '@yanyun/blocks-core';
import { BlockNode2View } from '../BlockRenderer';
import SectionView from './SectionView';

// SectionBlock layer-1 @module renderer: shell + children resolved via
// the Node2 match (recursion mirrors the three layers in fragments).
export default function SectionNode1View(props: {
  SectionNode1: fragments_SectionNode1$key;
  handlers: ActionHandlers;
}) {
  const data = useFragment(SectionNode1Fragment, props.SectionNode1);
  return (
    <SectionView title={data.title ?? null}>
      {data.children.map((child, i) => (
        <BlockNode2View key={i} block={child} handlers={props.handlers} />
      ))}
    </SectionView>
  );
}
