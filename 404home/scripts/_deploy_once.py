"""One-shot deploy to mainland VPS. Not for commit of secrets."""
import re
import tarfile
import time
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

tar_path = root / "_deploy_bundle.tgz"

print("packing…")
with tarfile.open(tar_path, "w:gz") as tar:
    dist = root / "dist"
    for p in dist.rglob("*"):
        if p.is_file():
            arc = Path("dist") / p.relative_to(dist)
            tar.add(p, arcname=str(arc).replace("\\", "/"))
    server = root / "server"
    for p in server.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(server)
        if "node_modules" in rel.parts or "data" in rel.parts:
            continue
        if p.name in {".env", ".env.local"}:
            continue
        if p.suffix == ".db" or str(p).endswith((".db-wal", ".db-shm")):
            continue
        arc = Path("server") / rel
        tar.add(p, arcname=str(arc).replace("\\", "/"))
    ng = root / "scripts" / "nginx-404home.conf"
    if ng.exists():
        tar.add(ng, arcname="scripts/nginx-404home.conf")

print(f"bundle {tar_path.stat().st_size / (1024 * 1024):.2f} MiB")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("ssh connect…")
client.connect(
    host,
    username=user,
    password=password,
    timeout=30,
    allow_agent=False,
    look_for_keys=False,
)

_, stdout, _ = client.exec_command(
    f"sudo mkdir -p {remote_root} && sudo chown -R {user}:{user} {remote_root}"
)
stdout.channel.recv_exit_status()

sftp = client.open_sftp()
remote_tar = f"/tmp/404home-deploy-{int(time.time())}.tgz"
print("upload…")
sftp.put(str(tar_path), remote_tar)
sftp.close()

extract = f"/tmp/404home-extract-{int(time.time())}"
cmds = f"""
set -e
cd {remote_root}
test -f server/.env && cp -a server/.env /tmp/404home.env.bak || true
mkdir -p {extract}
tar -xzf {remote_tar} -C {extract}
rm -rf dist
mv {extract}/dist dist
mkdir -p server/data
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude '.env' --exclude 'data/' --exclude 'node_modules/' {extract}/server/ server/
else
  find server -mindepth 1 -maxdepth 1 ! -name '.env' ! -name 'data' ! -name 'node_modules' -exec rm -rf {{}} +
  cp -a {extract}/server/. server/
fi
if [ -f /tmp/404home.env.bak ]; then cp -a /tmp/404home.env.bak server/.env; fi
cd server
if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
cd {remote_root}
pm2 restart 404home-api || (cd server && pm2 start index.js --name 404home-api && pm2 save)
sleep 2
pm2 status
curl -sS --retry 3 --retry-delay 1 http://127.0.0.1:3001/api/health
echo
curl -sS -o /dev/null -w "nginx_health=%{{http_code}}\\n" http://127.0.0.1/api/health
rm -f {remote_tar}
rm -rf {extract}
"""

print("remote apply…")
_, stdout, stderr = client.exec_command(cmds, get_pty=True)
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
code = stdout.channel.recv_exit_status()
log = root / "_deploy_last.log"
log.write_text(out + ("\nSTDERR:\n" + err if err.strip() else ""), encoding="utf-8")
print(f"remote log -> {log} exit={code}")
# ASCII-safe summary lines
for line in out.splitlines():
    if any(k in line for k in ("online", "404home", "ok", "nginx_health", "error", "ERR", "npm")):
        print(line.encode("ascii", "replace").decode("ascii"))
client.close()
tar_path.unlink(missing_ok=True)
raise SystemExit(code)
