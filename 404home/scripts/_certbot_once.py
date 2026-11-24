"""One-shot certbot attempt on production. Secrets from deploy.local.md only."""
import re
from pathlib import Path

import paramiko

root = Path(__file__).resolve().parents[1]
local_md = (root / "deploy.local.md").read_text(encoding="utf-8")
m = re.search(r"SSH 密码：`([^`]+)`", local_md)
if not m:
    raise SystemExit("password not found in deploy.local.md")
password = m.group(1)

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

cmd = r"""
set +e
echo "== probes =="
curl -sS -o /dev/null -w "local_host=%{http_code}\n" -H "Host: forty40.online" http://127.0.0.1/
curl -sS -o /dev/null -w "public_http=%{http_code}\n" --max-time 20 http://forty40.online/
curl -sS -o /dev/null -w "public_https=%{http_code}\n" --max-time 20 https://forty40.online/
if ! command -v certbot >/dev/null 2>&1; then
  echo CERTBOT_MISSING
  sudo apt-get update -qq && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq certbot python3-certbot-nginx
fi
echo "== certbot =="
sudo certbot --nginx -d forty40.online -d www.forty40.online --non-interactive --agree-tos --register-unsafely-without-email --redirect
echo certbot_exit=$?
curl -sS -o /dev/null -w "after_https=%{http_code}\n" --max-time 20 https://forty40.online/
nginx -t 2>&1 | tail -n 5
"""

_, stdout, stderr = client.exec_command(cmd, get_pty=True)
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
code = stdout.channel.recv_exit_status()
log = root / "_certbot_last.log"
log.write_text(out + ("\nSTDERR:\n" + err if err.strip() else ""), encoding="utf-8")
print(f"log -> {log} exit={code}")
for line in out.splitlines():
    if any(
        k in line.lower()
        for k in (
            "probe",
            "http",
            "https",
            "certbot",
            "success",
            "error",
            "congrat",
            "fail",
            "nginx",
            "missing",
            "exit",
        )
    ):
        print(line.encode("ascii", "replace").decode("ascii"))
client.close()
raise SystemExit(0 if "after_https=200" in out or "Congratulations" in out else 1)
