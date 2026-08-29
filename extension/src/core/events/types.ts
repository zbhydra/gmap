/**
 * 扩展单向事件类型。
 *
 * 只用于 Chrome/DOM EventBus 的通知链路，不承载 req-resp RPC。
 * 事件基建（EventDefinition / EventMessage / isEventMessage）是通用底座；
 * 业务事件在对应功能落地时按需补充定义。
 */

/** EventBus 可传递的事件 payload。 */
export type EventPayload = object | string | number | boolean | null | void

/** EventBus 事件定义约束。 */
export type EventDefinition = Record<string, EventPayload>

/** 提取事件名。 */
export type EventNames<TEvents extends EventDefinition> = keyof TEvents & string

/** 提取事件数据。 */
export type EventData<
  TEvents extends EventDefinition,
  TEvent extends EventNames<TEvents>
> = TEvents[TEvent]

/** EventBus 内部消息格式。 */
export interface EventMessage<
  TEvents extends EventDefinition,
  TEvent extends EventNames<TEvents> = EventNames<TEvents>
> {
  /** 单向事件标记。 */
  __event__: true
  /** 事件名。 */
  event: TEvent
  /** 事件数据。 */
  data: EventData<TEvents, TEvent>
}

/** 待判断的事件消息。 */
interface EventMessageCandidate {
  /** 单向事件标记。 */
  __event__?: boolean
  /** 事件名。 */
  event?: string
  /** 事件数据。 */
  data?: EventPayload
}

/** 判断消息是否为单向事件。 */
export function isEventMessage(
  value: EventMessageCandidate
): value is EventMessage<EventDefinition> {
  return value.__event__ === true && typeof value.event === 'string'
}

/** popup/content/background 之间的 Chrome 单向事件。暂无业务事件，落地时补充。 */
export interface ExtensionEvents extends EventDefinition {}

/** content 内部 DOM 单向事件。暂无业务事件，落地时补充。 */
export interface ContentEvents extends EventDefinition {}
