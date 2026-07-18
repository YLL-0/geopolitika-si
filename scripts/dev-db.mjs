/**
 * Local development database: PGlite (embedded Postgres) exposed over the
 * Postgres wire protocol, so no Docker or system Postgres install is needed.
 * Data persists in ./.dev-db. Production uses Supabase Postgres instead.
 *
 * Run with: pnpm dev:db (keep it running next to `pnpm dev`)
 */
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'

const db = await PGlite.create('./.dev-db')
const server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 5432, maxConnections: 10 })

await server.start()
console.log('PGlite dev database listening on postgresql://postgres:postgres@127.0.0.1:5432/geopolitika')

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await server.stop()
    await db.close()
    process.exit(0)
  })
}
