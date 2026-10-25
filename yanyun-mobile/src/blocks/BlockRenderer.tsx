// RN 端积木接线 (server 3D): 遍历/match 逻辑在 @yanyun/blocks-core
// (MatchContainer 逐节点按服务端回传的 @module 引用分发), 本文件只把
// 宿主的组件 loader 与 Unknown 占位注入核心遍历器。每个具体积木的
// 渲染组件在 ./modules/ 下一文件一个模块, 经 moduleLoader 按引用名
// 懒 require; 客户端不再有 __typename 分发表。叶子只负责呈现与触发
// 动作对象, 不做任何权限判断 (树由服务端按观看者组好)。
import { createBlockRenderer } from '@yanyun/blocks-core';
import { blockModuleLoader } from './moduleLoader';
import UnknownBlockView from './modules/UnknownBlockView';

export const { BlockNode1View, BlockNode2View, BlockLeafView } = createBlockRenderer({
  loader: blockModuleLoader,
  Unknown: UnknownBlockView,
});
