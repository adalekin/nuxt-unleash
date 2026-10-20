import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'

export const INSTANCE_ID = 'test-instance-id'

/**
 * GitLab's Unleash API for one project (lib/api/unleash.rb): `client/features` answers only to a known
 * `UNLEASH-INSTANCEID`, with the flags in the shape GitLab presents them.
 */
const FEATURES = {
  version: 1,
  features: [
    { name: 'for-everyone', enabled: true, strategies: [{ name: 'default', parameters: {} }] },
    { name: 'only-user-7', enabled: true, strategies: [{ name: 'userWithId', parameters: { userIds: '7' } }] },
    { name: 'switched-off', enabled: false, strategies: [{ name: 'default', parameters: {} }] },
  ],
}

export interface FakeGitlab {
  url: string
  close: () => Promise<void>
}

export async function startFakeGitlab(): Promise<FakeGitlab> {
  const server: Server = createServer((request, response) => {
    if (request.headers['unleash-instanceid'] !== INSTANCE_ID) {
      response.writeHead(401).end()
      return
    }
    if (request.method === 'GET' && request.url?.startsWith('/api/v4/feature_flags/unleash/1/client/features')) {
      response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(FEATURES))
      return
    }
    response.writeHead(404).end()
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  return {
    url: `http://127.0.0.1:${port}/api/v4/feature_flags/unleash/1`,
    close: () => new Promise<void>((resolve, reject) => server.close(error => (error ? reject(error) : resolve()))),
  }
}
