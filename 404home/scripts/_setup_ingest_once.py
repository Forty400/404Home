"""One-shot: set durable INGEST_TOKEN + sync config + verify ingest + pm2 cron."""
import re
from pathlib import Path

import paramiko

root = Path(__file__).resolve().parents[1]
local_md = (root / "deploy.local.md").read_text(encoding="utf-8")
m = re.search(r"SSH 密码：`([^`]+)`", local_md)
if not m:
    raise SystemExit("password not found in deploy.local.md")
password = m.group(1)

remote_script = r'''#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { execSync } = require('child_process')

const root = '/var/www/404home/server'
const envPath = path.join(root, '.env')
let envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
const env = {}
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2]
}

async function main() {
  let ingestToken = env.INGEST_TOKEN || ''
  if (!ingestToken || ingestToken.length < 16) {
    ingestToken = crypto.randomBytes(24).toString('hex')
  }

  const lines = envText.split(/\r?\n/).filter((l) => {
    return !/^PENDING_REVIEW_LIMIT=/.test(l)
      && !/^INGEST_API_BASE=/.test(l)
      && !/^INGEST_ADMIN_JWT=/.test(l)
      && !/^INGEST_CONFIG=/.test(l)
      && !/^INGEST_TOKEN=/.test(l)
  })
  while (lines.length && lines[lines.length - 1] === '') lines.pop()
  lines.push('PENDING_REVIEW_LIMIT=20')
  lines.push('INGEST_API_BASE=http://127.0.0.1:3001')
  lines.push('INGEST_CONFIG=./ingest/config.json')
  lines.push('INGEST_TOKEN=' + ingestToken)
  // keep ADMIN_* for fallback login; drop sticky JWT
  fs.writeFileSync(envPath, lines.join('\n') + '\n')
  console.log('env_updated ingest_token_len=' + ingestToken.length)

  const cfg = path.join(root, 'ingest/config.json')
  const ex = path.join(root, 'ingest/config.example.json')
  if (fs.existsSync(ex)) fs.copyFileSync(ex, cfg)
  console.log('config_synced')

  execSync('pm2 restart 404home-api', { stdio: 'inherit' })
  await new Promise((r) => setTimeout(r, 2500))

  const ingest = execSync('node ingest/run.js', {
    cwd: root,
    encoding: 'utf8',
    timeout: 180000,
    env: { ...process.env, ...Object.fromEntries(lines.map((l) => {
      const i = l.indexOf('=')
      return i > 0 ? [l.slice(0, i), l.slice(i + 1)] : [l, '']
    }).filter(([k]) => k)) }
  })
  console.log(ingest)

  try { execSync('pm2 delete 404home-ingest', { stdio: 'ignore' }) } catch (_) {}
  execSync(
    'pm2 start ingest/run.js --name 404home-ingest --cron "0 1 * * *" --no-autorestart',
    { cwd: root, stdio: 'inherit' }
  )
  execSync('pm2 save', { stdio: 'inherit' })

  // smoke: durable token can POST without JWT
  const smoke = await fetch('http://127.0.0.1:3001/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Ingest-Token': ingestToken
    },
    body: JSON.stringify({
      type: 'news',
      title: 'ingest-token-smoke-' + Date.now(),
      summary: 'smoke',
      content: 'smoke',
      topic: 'news',
      source_url: 'https://example.com/ingest-smoke-' + Date.now(),
      lifecycle: 'pending_review',
      ingest: true
    })
  })
  const smokeBody = await smoke.json().catch(() => ({}))
  console.log('token_post_status=' + smoke.status + (smokeBody.id ? ' id=' + smokeBody.id : ''))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
'''

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(
    "111.230.147.223",
    username="ubuntu",
    password=password,
    timeout=30,
    allow_agent=False,
    look_for_keys=False,
)
sftp = client.open_sftp()
remote_path = "/tmp/404home-setup-ingest.js"
with sftp.file(remote_path, "w") as f:
    f.write(remote_script)
sftp.close()

_, stdout, stderr = client.exec_command(f"node {remote_path}", get_pty=True, timeout=240)
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
code = stdout.channel.recv_exit_status()
(root / "_ingest_setup_last.log").write_text(out + ("\nSTDERR:\n" + err if err.strip() else ""), encoding="utf-8")
for line in out.splitlines():
    if "INGEST_TOKEN=" in line:
        continue
    print(line.encode("ascii", "replace").decode("ascii"))
client.exec_command(f"rm -f {remote_path}")
client.close()
raise SystemExit(code)
