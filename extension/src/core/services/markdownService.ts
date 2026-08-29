import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false, // 禁用 HTML 渲染以防止 XSS 攻击
  linkify: true,
  typographer: true
})

export function convertMarkdownToHTML(markdown: string): string {
  return md.render(markdown)
}

export default md
