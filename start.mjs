import dotenv from 'dotenv'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

dotenv.config()

const port = process.env.APP_PORT || '3000'
console.log(`[Launcher] Starting Delcom Cash Flow on port: ${port}...`)

const outputServerPath = path.resolve(process.cwd(), '.output', 'server', 'index.mjs')

let cmd = 'bun'
let args = []

if (fs.existsSync(outputServerPath)) {
  cmd = 'bun'
  args = ['run', outputServerPath]
} else {
  cmd = 'bun'
  args = ['run', 'nuxt', 'preview', '--port', String(port)]
}

const child = spawn(cmd, args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: String(port),
    NITRO_PORT: String(port),
    APP_PORT: String(port)
  }
})

child.on('close', (code) => {
  process.exit(code ?? 0)
})

child.on('error', (err) => {
  console.error('[Launcher] Failed to start process:', err)
  process.exit(1)
})
