import React from 'react';
import { useFragment } from 'react-relay';
import { SectionNode1Fragment } from '../fragments';
import type { ActionHandlers, fragments_SectionNode1$key } from '@yanyun/blocks-core';
import { BlockNode2View } from '../BlockRenderer';
import SectionView from './SectionView';

// SectionBlock 的第 1 层 @module 渲染组件: 外壳 + children 走 Node2 层
// match 继续逐节点解析 (递归与 fragments 的三层结构对应)。
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
