/** 统一 HTTP 客户端的请求、响应、重试与异常合同测试。 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HttpClient } from '../../src/core/api/client/HttpClient'
import { ApiError } from '../../src/core/api/client/types'

vi.mock('../../src/core/api/config', () => ({
  API_CONFIG: {
    TIMEOUT: 25,
    RETRY_COUNT: 2,
    RETRY_DELAY: 0
  }
}))

function expectLogArgumentsNotToContain(
  calls: readonly (readonly unknown[])[],
  secrets: readonly string[]
): void {
  const logArguments = calls.flat()
  for (const argument of logArguments) {
    const logged =
      argument instanceof Error
        ? `${argument.name}\n${argument.message}\n${argument.stack ?? ''}`
        : JSON.stringify(argument)
    if (logged === undefined) continue
    for (const secret of secrets) {
      expect(logged).not.toContain(secret)
    }
  }
}

describe('HttpClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.mocked(console.error).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('builds query parameters and runs request and response interceptors in order', async () => {
    const client = new HttpClient('https://api.example.test')
    const order: string[] = []

    client.useRequest(context => {
      order.push('request-one')
      context.options.headers = { ...context.options.headers, 'X-First': '1' }
      return context
    })
    client.useRequest(async context => {
      order.push('request-two')
      context.options.headers = { ...context.options.headers, 'X-Second': '2' }
      return context
    })
    client.useResponse((response, context) => {
      order.push('response')
      expect(context.method).toBe('GET')
      response.data = { result: 'intercepted' }
      return response
    })
    fetchMock.mockResolvedValue(jsonResponse({ result: 'server' }))

    await expect(
      client.get<{ result: string }>('/items', {
        params: { query: 'a b', page: 2 },
        headers: { Existing: 'yes' }
      })
    ).resolves.toEqual({ result: 'intercepted' })

    expect(order).toEqual(['request-one', 'request-two', 'response'])
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/items?query=a+b&page=2',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Existing: 'yes',
          'X-First': '1',
          'X-Second': '2'
        }
      })
    )
  })

  it('serializes the POST body', async () => {
    const client = new HttpClient('https://api.example.test')
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }))

    const result = await client.post<{ ok: boolean }>(
      '/items',
      { value: 'POST' },
      { headers: { 'X-Test': 'POST' } }
    )

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ value: 'POST' }),
        headers: { 'X-Test': 'POST' }
      })
    )
  })

  it('returns text directly and safely maps a sensitive invalid login response to null', async () => {
    const client = new HttpClient('https://api.example.test')
    fetchMock
      .mockResolvedValueOnce(
        new Response('plain response', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        })
      )
      .mockResolvedValueOnce(
        new Response('invalid\nBearer access-secret-token\nresponse-secret', {
          status: 200,
          headers: { 'Content-Type': 'application/octet-stream' }
        })
      )

    await expect(client.get('/plain')).resolves.toBe('plain response')
    await expect(
      client.post('/auth/extension-login/exchange', { code: 'login-body-secret' })
    ).resolves.toBeNull()
    expect(console.error).toHaveBeenCalledOnce()
    expect(console.error).toHaveBeenCalledWith(
      '[HttpClient] JSON 解析失败: method=POST url=https://api.example.test/auth/extension-login/exchange status=200 stage=success-response',
      expect.objectContaining({
        name: 'SyntaxError',
        message: 'JSON response parsing failed',
        stack: expect.stringContaining('toSafeJsonParseError')
      })
    )
    const logCall = vi.mocked(console.error).mock.calls[0]
    expect(logCall).toHaveLength(2)
    expectLogArgumentsNotToContain(vi.mocked(console.error).mock.calls, [
      'access-secret-token',
      'response-secret',
      'login-body-secret'
    ])
  })

  it.each([
    [{ code: 50001, msg: 'backend msg', data: { reason: 'quota' } }, 'backend msg', 50001],
    [{ message: 'backend message' }, 'backend message', undefined],
    [{}, 'HTTP 400', undefined]
  ])('maps an HTTP error envelope to ApiError', async (body, message, backendCode) => {
    const client = new HttpClient('https://api.example.test')
    const intercepted = vi.fn()
    client.useError(intercepted)
    fetchMock.mockResolvedValue(jsonResponse(body, 400))

    const request = client.get('/failure', { skipRetry: true })

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      message,
      status: 400,
      backendCode,
      data: backendCode === 50001 ? { reason: 'quota' } : undefined
    })
    expect(intercepted).toHaveBeenCalledOnce()
  })

  it('maps a non-JSON error safely and logs once without response body, token or request body', async () => {
    const client = new HttpClient('https://api.example.test')
    fetchMock.mockResolvedValue(
      new Response('invalid\nBearer access-secret-token\nresponse-secret', {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    await expect(
      client.post(
        '/failure?access_token=query-secret',
        { token: 'body-secret' },
        { headers: { Authorization: 'Bearer access-secret-token' }, skipRetry: true }
      )
    ).rejects.toMatchObject({
      message: 'Invalid JSON error response',
      status: 502,
      backendCode: 'INVALID_ERROR_RESPONSE',
      data: null
    })

    expect(console.error).toHaveBeenCalledTimes(2)
    const parseLogCall = vi.mocked(console.error).mock.calls[0]
    expect(parseLogCall?.[0]).toBe(
      '[HttpClient] JSON 解析失败: method=POST url=https://api.example.test/failure status=502 stage=error-response'
    )
    expect(parseLogCall?.[1]).toMatchObject({
      name: 'SyntaxError',
      message: 'JSON response parsing failed',
      stack: expect.stringContaining('toSafeJsonParseError')
    })
    const requestLogCall = vi.mocked(console.error).mock.calls[1]
    expect(requestLogCall).toHaveLength(1)
    expect(requestLogCall?.[0]).toContain(
      'POST https://api.example.test/failure status=502 code=INVALID_ERROR_RESPONSE message=Invalid JSON error response'
    )
    expectLogArgumentsNotToContain(vi.mocked(console.error).mock.calls, [
      'query-secret',
      'body-secret',
      'Bearer',
      'access-secret-token',
      'response-secret'
    ])
  })

  it('retries only while an error interceptor requests another attempt', async () => {
    const client = new HttpClient('https://api.example.test')
    let retries = 0
    client.useError((_error, context) => {
      if (retries < 2) {
        retries += 1
        context._shouldRetry = true
      }
    })
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ msg: 'temporary' }, 503))
      .mockResolvedValueOnce(jsonResponse({ msg: 'temporary' }, 503))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))

    await expect(client.get('/retry')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('runs error interceptors for ApiError from a response interceptor', async () => {
    const client = new HttpClient('https://api.example.test')
    const intercepted = vi.fn()
    const apiError = new ApiError('business failure', 200, 50002)
    client.useResponse(() => {
      throw apiError
    })
    client.useError(intercepted)
    fetchMock.mockResolvedValue(jsonResponse({ ok: false }))

    await expect(client.get('/business')).rejects.toBe(apiError)
    expect(intercepted).toHaveBeenCalledWith(apiError, expect.objectContaining({ method: 'GET' }))
  })

  it('propagates a non-ApiError from a response interceptor', async () => {
    const client = new HttpClient('https://api.example.test')
    client.useResponse(() => {
      throw new TypeError('invalid response contract')
    })
    fetchMock.mockResolvedValue(jsonResponse({ ok: false }))

    await expect(client.get('/business')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'invalid response contract',
      backendCode: 'NETWORK_ERROR'
    })
  })

  it('wraps a fetch failure as ApiError and sends the same error to interceptors', async () => {
    const client = new HttpClient('https://api.example.test')
    const intercepted = vi.fn()
    client.useError(intercepted)
    fetchMock.mockRejectedValue(new TypeError('offline'))

    const request = client.get('/offline')

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      message: 'offline',
      backendCode: 'NETWORK_ERROR'
    })
    expect(intercepted).toHaveBeenCalledOnce()
    expect(intercepted.mock.calls[0]?.[0]).toMatchObject({ backendCode: 'NETWORK_ERROR' })
    expect(console.error).toHaveBeenCalledOnce()
    expect(vi.mocked(console.error).mock.calls[0]?.[1]).toBeInstanceOf(TypeError)
  })

  it('turns an aborted fetch into a timeout ApiError', async () => {
    vi.useFakeTimers()
    const client = new HttpClient('https://api.example.test')
    const pendingFetch: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('aborted', 'AbortError'))
        })
      })
    fetchMock.mockImplementation(pendingFetch)

    const request = client.get('/slow', { timeout: 5 })
    const assertion = expect(request).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Request timeout',
      backendCode: 'TIMEOUT'
    })
    await vi.advanceTimersByTimeAsync(5)

    await assertion
  })

  it('honors a caller supplied abort signal', async () => {
    const client = new HttpClient('https://api.example.test')
    const controller = new AbortController()
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }))

    await client.get('/signal', { signal: controller.signal })

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ signal: controller.signal })
  })
})

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
