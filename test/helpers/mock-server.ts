import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

/** A canned HTTP response: status plus an optional JSON body. */
export interface MockResponse {
  status: number
  body?: unknown
}

/** Per-test overrides for the GitHub endpoints the release flow hits. */
export interface MockConfig {
  getCommit?: MockResponse
  createRelease?: MockResponse
  upload?: MockResponse
}

export interface MockServer {
  url: string
  requests: Array<{ method: string; url: string; body: string }>
  close: () => Promise<void>
}

/**
 * Start a throwaway local server that stands in for the GitHub REST + uploads
 * API. Octokit's `baseUrl` and the release `upload_url` both point at it, so
 * the real client and the real gh-release-assets uploader exercise it end to end.
 */
export async function startMockServer(config: MockConfig = {}): Promise<MockServer> {
  const requests: MockServer['requests'] = []

  const server = createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const url = req.url ?? ''
      const method = req.method ?? 'GET'
      requests.push({ method, url, body })

      const port = (server.address() as AddressInfo).port
      const send = (status: number, payload: unknown) => {
        res.writeHead(status, { 'content-type': 'application/json' })
        res.end(JSON.stringify(payload))
      }

      if (url.startsWith('/uploads')) {
        return send(config.upload?.status ?? 200, config.upload?.body ?? {})
      }
      if (method === 'POST' && /\/repos\/[^/]+\/[^/]+\/releases$/.test(url)) {
        const r = config.createRelease ?? { status: 201 }
        return send(
          r.status,
          r.body ?? {
            upload_url: `http://127.0.0.1:${port}/uploads/assets{?name,label}`,
            html_url: 'https://github.com/o/r/releases/tag/v1.0.0'
          }
        )
      }
      if (method === 'GET' && /\/repos\/[^/]+\/[^/]+\/commits\//.test(url)) {
        const r = config.getCommit ?? { status: 200 }
        return send(r.status, r.body ?? { sha: 'deadbeef' })
      }
      return send(404, { message: 'Not Found' })
    })
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  const { port } = server.address() as AddressInfo

  return {
    url: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise<void>((resolve) => server.close(() => resolve()))
  }
}
