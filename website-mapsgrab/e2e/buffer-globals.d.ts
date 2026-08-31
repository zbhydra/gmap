/**
 * e2e 类型门禁的最小 Buffer 声明。
 *
 * tools.spec.ts 的 setInputFiles 用到 Buffer.from;为避免为此引入 @types/node 依赖,
 * 按 spec 实际用法声明最小全局形态(与 Playwright d.ts 引用的全局 Buffer 同名闭环,
 * 仅类型面,无运行时代码)。
 */
declare var Buffer: BufferConstructor

interface Buffer extends Uint8Array {}

interface BufferConstructor {
  from(input: string): Buffer
}
