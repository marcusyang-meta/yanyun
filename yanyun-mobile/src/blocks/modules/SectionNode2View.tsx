import React from 'react';
import { useFragment } from 'react-relay';
import { SectionNode2Fragment } from '../fragments';
import type { ActionHandlers, fragments_SectionNode2$key } from '@yanyun/blocks-core';
import { BlockLeafView } from '../BlockRenderer';
import SectionView from './SectionView';

// SectionBlock layer-2 @module renderer: shell + children resolved via
// the Leaf match (deepest layer; a deeper SectionBlock has no arm there
// and falls back to the Unknown placeholder).
export default function SectionNode2View(props: {
  SectionNode2: fragments_SectionNode2$key;
  handlers: ActionHandlers;
}) {
  const data = useFragment(SectionNode2Fragment, props.SectionNode2);
  return (
    <SectionView title={data.title ?? null}>
      {data.children.map((child, i) => (
        <BlockLeafView key={i} block={child} handlers={props.handlers} />
      ))}
    </SectionView>
  );
}
