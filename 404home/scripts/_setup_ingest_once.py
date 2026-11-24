"""One-shot: wire ingest env + first run + pm2 cron on production."""
import re
from pathlib import Path

import paramiko

root = Path(__file__).resolve().parents[1]
local_md = (root / "deploy.local.md").read_text(encoding="utf-8")
m = re.search(r"SSH 密码：`([^`]+)`", local_md)
if not m:
    raise SystemExit("password not found in deploy.local.md")
password = m.group(1)
host = "111.230.147.223"
user = "ubuntu"
remote_root = "/var/www/404home"

remote_script = r'''#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = '/var/www/404home/server'
const envPath = path.join(root, '.env')
let envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
const env = {}
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2]
}
const user = env.ADMIN_USERNAME || 'admin'
const pass = env.ADMIN_PASSWORD || 'admin123'

async function main() {
  const login = await fetch('http://127.0.0.1:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user, password: pass })
  })
  const body = await login.json()
  if (!body.token) {
    console.error('login failed', body)
    process.exit(1)
  }
  const token = body.token
  console.log('jwt_ok len=' + token.length)

  const lines = envText.split(/\r?\n/).filter((l) => {
    return !/^PENDING_REVIEW_LIMIT=/.test(l)
      && !/^INGEST_API_BASE=/.test(l)
      && !/^INGEST_ADMIN_JWT=/.test(l)
      && !/^INGEST_CONFIG=/.test(l)
  })
  while (lines.length && lines[lines.length - 1] === '') lines.pop()
  lines.push('PENDING_REVIEW_LIMIT=20')
  lines.push('INGEST_API_BASE=http://127.0.0.1:3001')
  lines.push('INGEST_ADMIN_JWT=' + token)
  lines.push('INGEST_CONFIG=./ingest/config.json')
  fs.writeFileSync(envPath, lines.join('\n') + '\n')
  console.log('env_updated')

  const cfg = path.join(root, 'ingest/config.json')
  const ex = path.join(root, 'ingest/config.example.json')
  if (!fs.existsSync(cfg) && fs.existsSync(ex)) fs.copyFileSync(ex, cfg)

  execSync('pm2 restart 404home-api', { stdio: 'inherit' })
  await new Promise((r) => setTimeout(r, 2000))

  // load dotenv for child by exporting in shell
  const ingest = execSync(
    `INGEST_ADMIN_JWT='${token}' INGEST_API_BASE=http://127.0.0.1:3001 INGEST_CONFIG=./ingest/config.json node ingest/run.js`,
    { cwd: root, encoding: 'utf8', timeout: 180000 }
  )
  console.log(ingest)

  try { execSync('pm2 delete 404home-ingest', { stdio: 'ignore' }) } catch (_) {}
  // daily 01:00 UTC ≈ 09:00 CST
  execSync(
    'pm2 start ingest/run.js --name 404home-ingest --cron "0 1 * * *" --no-autorestart',
    { cwd: root, stdio: 'inherit' }
  )
  execSync('pm2 save', { stdio: 'inherit' })

  const list = await fetch('http://127.0.0.1:3001/api/posts?all=1&lifecycle=pending_review', {
    headers: { Authorization: 'Bearer ' + token }
  })
  const posts = await list.json()
  console.log('pending_count=' + (Array.isArray(posts) ? posts.length : JSON.stringify(posts)))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
'''

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, username=user, password=password, timeout=30, allow_agent=False, look_for_keys=False)

sftp = client.open_sftp()
remote_path = "/tmp/404home-setup-ingest.js"
with sftp.file(remote_path, "w") as f:
    f.write(remote_script)
sftp.close()

_, stdout, stderr = client.exec_command(f"node {remote_path}", get_pty=True, timeout=240)
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
code = stdout.channel.recv_exit_status()
log = root / "_ingest_setup_last.log"
log.write_text(out + ("\nSTDERR:\n" + err if err.strip() else ""), encoding="utf-8")
print(f"exit={code} log={log}")
for line in out.splitlines():
    low = line.lower()
    if any(k in low for k in ("jwt", "env_", "pending", "ingest", "ok", "fail", "error", "posted", "skip", "cron", "404home")):
        print(line.encode("ascii", "replace").decode("ascii"))
client.exec_command(f"rm -f {remote_path}")
client.close()
raise SystemExit(code)
