/**
 * MCP 落地页交互（components/pages/McpPage.astro）：
 * - 首屏示例会话：输入框打出提问 → 发送 → 思考 → 工具调用运行并逐行给出结果 → 回答；场景来自 <template data-mcp-scene>，
 *   轮播时客户端标签随场景切换。
 * - 连接拓扑：轮流高亮一个客户端与一个工具，脉冲沿连线经过 MCP 入口，入口下方的调用标签同步切换。
 * 两处离屏或页面在后台时停止；无 JS 与减弱动效下保持 HTML 里的首个场景与静态拓扑。
 */
import { inView, reducedMotion, wait } from '../site/motion'

/** 会话节奏（ms）：逐字输入、发送停顿、思考、工具运行、结果逐行、回答停留与场景淡出。 */
const TYPE_MS = 22
const SEND_MS = 320
const THINK_MS = 900
const CALL_MS = 1100
const OUT_MS = 140
const HOLD_MS = 4600
const LEAVE_MS = 360
/** 首屏会话窗在 data-reveal-onload（520ms）显现之后再开始输入。 */
const START_DELAY_MS = 760
/** 拓扑每轮高亮的间隔；两段连线脉冲合计 2 × --dur-5，短于该间隔。 */
const TOPO_STEP_MS = 2600

function initAgent(agent: HTMLElement): void {
  const stage = agent.querySelector<HTMLElement>('[data-mcp-stage]')
  const input = agent.querySelector<HTMLElement>('[data-mcp-input]')
  const client = agent.querySelector<HTMLElement>('[data-mcp-client]')
  const templates = Array.from(document.querySelectorAll<HTMLTemplateElement>('template[data-mcp-scene]'))
  if (!stage || !input || !client || !templates.length) throw new Error('[mcp-page] Agent markup is incomplete.')
  if (reducedMotion()) return

  const placeholder = input.textContent ?? ''
  const setInput = (text: string) => {
    input.textContent = text || placeholder
    input.classList.toggle('is-filled', Boolean(text))
    input.classList.toggle('is-typing', Boolean(text))
  }
  let run = 0
  let scene = 0

  const play = async (id: number): Promise<void> => {
    while (id === run) {
      const template = templates[scene]
      stage.classList.remove('is-leaving')
      stage.replaceChildren(template.content.cloneNode(true))
      client.textContent = template.dataset.client ?? ''
      const steps = Array.from(stage.querySelectorAll<HTMLElement>('[data-step]'))
      const thinking = stage.querySelector<HTMLElement>('[data-thinking]')
      const prompt = steps.find(step => step.dataset.step === 'prompt')?.textContent ?? ''
      for (let count = 1; count <= prompt.length; count++) {
        setInput(prompt.slice(0, count))
        await wait(TYPE_MS)
        if (id !== run) return
      }
      await wait(SEND_MS)
      if (id !== run) return
      setInput('')
      for (const step of steps) {
        const kind = step.dataset.step
        if (kind === 'call') step.classList.add('is-running')
        step.classList.add('is-shown')
        if (kind === 'prompt') {
          thinking?.classList.add('is-active')
          await wait(THINK_MS)
          thinking?.classList.remove('is-active')
        } else if (kind === 'call') {
          await wait(CALL_MS)
          step.classList.remove('is-running')
        } else {
          await wait(kind === 'answer' ? HOLD_MS : OUT_MS)
        }
        if (id !== run) return
      }
      stage.classList.add('is-leaving')
      await wait(LEAVE_MS)
      if (id !== run) return
      scene = (scene + 1) % templates.length
    }
  }

  agent.classList.add('is-armed')
  let first = true
  inView(agent, visible => {
    const id = ++run
    if (!visible) {
      setInput('')
      return
    }
    void wait(first ? START_DELAY_MS : 0).then(() => play(id))
    first = false
  }, { once: false, threshold: 0.3 })
}

function initTopology(topo: HTMLElement): void {
  const clients = Array.from(topo.querySelectorAll<HTMLElement>('[data-topo-client]'))
  const tools = Array.from(topo.querySelectorAll<HTMLElement>('[data-topo-tool]'))
  const callTool = topo.querySelector<HTMLElement>('[data-topo-call-tool]')
  const callResult = topo.querySelector<HTMLElement>('[data-topo-call-result]')
  if (!clients.length || !tools.length || !callTool || !callResult) throw new Error('[mcp-page] Topology markup is incomplete.')
  if (reducedMotion()) return

  let step = 0
  let timer = 0
  const activate = () => {
    const activeClient = clients[step % clients.length]
    const activeTool = tools[step % tools.length]
    clients.forEach(node => node.classList.toggle('is-active', node === activeClient))
    tools.forEach(node => node.classList.toggle('is-active', node === activeTool))
    callTool.textContent = activeTool.dataset.topoTool ?? ''
    callResult.textContent = activeTool.dataset.topoResult ?? ''
    // 重新触发两段连线的一次性脉冲动画。
    topo.classList.remove('is-pulsing')
    void topo.offsetWidth
    topo.classList.add('is-pulsing')
    step += 1
  }
  inView(topo, visible => {
    window.clearInterval(timer)
    if (!visible) return
    activate()
    timer = window.setInterval(activate, TOPO_STEP_MS)
  }, { once: false, threshold: 0.3 })
}

/** McpPage.astro 调用一次。 */
export function initMcpPage(): void {
  const agent = document.querySelector<HTMLElement>('[data-mcp-agent]')
  if (agent) initAgent(agent)
  const topo = document.querySelector<HTMLElement>('[data-mcp-topo]')
  if (topo) initTopology(topo)
}
