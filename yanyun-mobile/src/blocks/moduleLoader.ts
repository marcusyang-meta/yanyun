/* eslint-disable @typescript-eslint/no-require-imports --
   懒加载机制本体: 渲染模块只能经 require thunk 按名延迟求值,
   静态 import 会把全部叶子在启动时一并载入, 与 @module 语义相悖。 */
import type { ComponentType } from 'react';
import UnknownBlockView from './modules/UnknownBlockView';

// server 3D 的组件侧解析 (JSResource 在 RN/Expo 的落地形态):
// 服务端经 Block.js 回传的 __module_component 引用就是 @module(name:)
// 的名字 (如 "TextBlock")。MatchContainer 的 loader 收到该引用时,
// 这里才经 require() 把对应渲染模块求值并缓存 —— 模块注册的是惰性
// thunk, 应用启动时不加载任何叶子模块; 客户端没有的引用 (服务端
// 新类型) 解析为 Unknown 占位。Metro 对静态 require 路径正常打包,
// Expo Go / 原生 / Web 三种运行时同一路径 (require 是同步的,
// MatchContainer 的同步 loader 契约天然满足)。
const MODULE_LOADERS: Record<string, () => ComponentType<any>> = {
  TextBlock: () => require('./modules/TextBlockView').default,
  BannerBlock: () => require('./modules/BannerBlockView').default,
  SectionHeaderBlock: () => require('./modules/SectionHeaderBlockView').default,
  ChipRowBlock: () => require('./modules/ChipRowBlockView').default,
  GroupingCardBlock: () => require('./modules/GroupingCardBlockView').default,
  SeatGridBlock: () => require('./modules/SeatGridBlockView').default,
  ActionButtonBlock: () => require('./modules/ActionButtonBlockView').default,
  EmptyStateBlock: () => require('./modules/EmptyStateBlockView').default,
  SpacerBlock: () => require('./modules/SpacerBlockView').default,
  FallbackBlock: () => require('./modules/FallbackBlockView').default,
  SectionNode1: () => require('./modules/SectionNode1View').default,
  SectionNode2: () => require('./modules/SectionNode2View').default,
};

const moduleCache = new Map<string, ComponentType<any>>();

export function blockModuleLoader(moduleRef: unknown): ComponentType<any> {
  const name = typeof moduleRef === 'string' ? moduleRef : '';
  const cached = moduleCache.get(name);
  if (cached) return cached;
  const load = MODULE_LOADERS[name];
  const component = load ? load() : UnknownBlockView;
  moduleCache.set(name, component);
  return component;
}
