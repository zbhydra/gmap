/**
 * 官网运行时跨模块共享的 localStorage 键。
 *
 * 单独放在无副作用模块中，避免鉴权模块在首屏之外的场景被提前拉起。
 */

/** 用户登录 access token 的 localStorage 键。 */
export const ACCESS_TOKEN_STORAGE_KEY = 'homepage_access_token'
