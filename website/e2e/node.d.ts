/**
 * shortcut: 仅声明 e2e 实际使用的 Node API，使用面扩大时改用 @types/node。
 */
declare var Buffer: BufferConstructor

interface Buffer extends Uint8Array {
  subarray(start?: number, end?: number): Buffer
}

interface BufferConstructor {
  from(input: string | readonly number[]): Buffer
}

declare const process: {
  env: Record<string, string | undefined>
}

declare module 'node:child_process' {
  export function execFileSync(
    file: string,
    args: readonly string[],
    options: { cwd: string; encoding: 'utf8' }
  ): string
}

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string
  export function readFileSync(path: string): Buffer
}

declare module 'node:fs/promises' {
  export function readFile(path: string, encoding: 'utf8'): Promise<string>
}

declare module 'node:http' {
  interface IncomingMessage {
    url?: string
  }

  interface ServerResponse {
    writeHead(statusCode: number, headers: Record<string, string>): ServerResponse
    end(body: string): void
  }

  interface Server {
    listen(port: number, host: string, callback: () => void): Server
    address(): { port: number } | string | null
    unref(): Server
  }

  export function createServer(listener: (request: IncomingMessage, response: ServerResponse) => void): Server
}
