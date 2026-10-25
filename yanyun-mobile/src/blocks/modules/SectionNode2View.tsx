import React from 'react';
import { useFragment } from 'react-relay';
import { SectionNode2Fragment } from '../fragments';
import type { ActionHandlers, fragments_SectionNode2$key } from '@yanyun/blocks-core';
import { BlockLeafView } from '../BlockRenderer';
import SectionView from './SectionView';

// SectionBlock 的第 2 层 @module 渲染组件: 外壳 + children 走 Leaf 层
// match (最深一层; 再深的 SectionBlock 在该层无臂 → Unknown 占位)。
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
