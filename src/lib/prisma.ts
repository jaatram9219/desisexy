import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { resolve } from 'path'

function resolveDbUrl(): string {
  const raw = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
  // Turso/remote URLs — use as-is
  if (raw.startsWith('libsql://') || raw.startsWith('http')) return raw
  // Local SQLite — convert relative to absolute path
  const filePath = raw.replace(/^file:/, '')
  const absPath = resolve(process.cwd(), filePath)
  return `file:${absPath}`
}

function createPrismaClient() {
  const url = resolveDbUrl()
  const authToken = process.env.TURSO_AUTH_TOKEN

  // PrismaLibSql is a factory — pass config directly, not a pre-created client
  const adapter = new PrismaLibSql({ url, authToken: authToken || undefined })
  return new PrismaClient({ adapter })
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
