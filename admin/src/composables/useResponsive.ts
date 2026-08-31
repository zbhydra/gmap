/**
 * 响应式断点 composable
 *
 * 断点体系统一两档，CSS 侧保持同一数值：
 * - 960px：移动 / 桌面切换主断点（对齐 design.md「单列阈值 960px」），
 *   决定布局形态（侧边栏 vs 抽屉导航）、表单 label 位置、抽屉与弹层宽度。
 * - 560px：小屏单列降级，仅在各 view 的 scoped media query 中使用，无 JS 消费方。
 */
import { ref } from "vue";

/** 移动 / 桌面主断点，与各 view scoped style 中 960px 的 media query 保持一致。 */
export const MOBILE_BREAKPOINT_PX = 960;

const isMobile = ref(false);

let bound = false;

/** 模块级单例：所有消费方共享一个 matchMedia 监听器，避免重复绑定。 */
function bindOnce() {
  if (bound) {
    return;
  }
  bound = true;
  const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
  isMobile.value = mediaQuery.matches;
  mediaQuery.addEventListener("change", (event) => {
    isMobile.value = event.matches;
  });
}

/** 当前是否为移动布局（视口宽度 ≤ 960px）。 */
export function useIsMobile() {
  bindOnce();
  return isMobile;
}
