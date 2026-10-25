// 当前登录用户 (Discord 资料, 纯展示用; 权限结论不在前端, 由后端响应类型表达)
export interface ViewerUser {
  discordId: string;
  name: string;
  avatar?: string | null;
}
