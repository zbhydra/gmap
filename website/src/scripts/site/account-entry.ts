/**
 * 导航账户入口（Layout 全站脚本）。
 *
 * 恢复站级会话后切换导航右侧的登录按钮 / Dashboard 链接：匿名显示登录
 * （打开站级登录弹窗并声明登录后进 Dashboard），已登录或会话网络失败
 * （token 仍在）显示 Dashboard 链接。登录成功按弹窗记录的跳转意图导航。
 */

import { SITE_AUTH_SUCCESS_EVENT } from '../../components/auth/site-auth-controller'
import { getSiteSession } from './session'

/** 导航登录入口声明登录后进入的 Dashboard 页。 */
const NAV_LOGIN_REDIRECT = '/dashboard/'

/** 初始化导航账户入口。 */
export function initSiteAccountEntry(): void {
  const authButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-site-auth-entry]'))
  const dashboardLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-site-dashboard-link]'))
  // 页面关闭站级账户入口（includeSiteAuth=false，如插件授权桥）时整体不参与：
  // 不绑事件、不发共享会话恢复请求，认证归页面自身 owner。
  if (authButtons.length === 0 && dashboardLinks.length === 0) {
    return
  }

  for (const button of authButtons) {
    button.addEventListener('click', () => {
      window.siteAuthController?.open({ redirectTo: NAV_LOGIN_REDIRECT })
    })
  }

  void getSiteSession().then(session => {
    renderAccountEntry(authButtons, dashboardLinks, session.status !== 'signed-out')
  })

  window.addEventListener(SITE_AUTH_SUCCESS_EVENT, () => {
    // 跳转意图由 site-auth-controller 持有并消费；这里保证导航入口立即切到 Dashboard 态。
    renderAccountEntry(authButtons, dashboardLinks, true)
  })
}

/** 切换登录按钮与 Dashboard 链接可见性（桌面与移动端各一组）。 */
function renderAccountEntry(
  authButtons: HTMLButtonElement[],
  dashboardLinks: HTMLAnchorElement[],
  signedIn: boolean
): void {
  for (const button of authButtons) {
    button.hidden = signedIn
  }
  for (const link of dashboardLinks) {
    link.hidden = !signedIn
  }
}
