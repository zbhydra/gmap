/*
 * 在 <head> 同步执行（不加 defer）：
 *  1. 标记 html.js —— [data-reveal] 的初始隐藏只在 JS 可用时生效，无 JS 时内容直接可读；
 *  2. 恢复用户手动选择的主题，避免首帧闪烁。未手动选择时不写 data-theme，跟随系统。
 */
(function () {
  var root = document.documentElement
  root.classList.add('js')
  try {
    var saved = localStorage.getItem('mg-theme')
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved)
  } catch (error) {
    // 隐私模式等场景 localStorage 不可用：保持跟随系统
  }
})()
