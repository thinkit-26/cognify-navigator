# Deploying the Viva backend

Merging to `main` with a change under `Oral_bot/backend/` or `Oral_bot/deploy/` runs
`.github/workflows/deploy-backend.yml`, which logs in to the server over SSH and runs `deploy.sh`:
`git pull`, `pip install -r requirements.txt`, restart `cognify-backend`, check `http://127.0.0.1:8000/`
answers, and roll back to the previous commit if it does not. A failed deploy shows as a red run in the
repo's Actions tab. The website itself is deployed by Cloudflare, not by this.

## One-time setup

**1. On your computer, make a key used only for deploying** (no passphrase, so Actions can use it):
```bash
ssh-keygen -t ed25519 -N "" -C "github-deploy" -f ~/cognify_deploy_key
```

**2. On the server**, as the user that owns the app folder (`shesh`):

Let that key run only the deploy script. Add one line to `~/.ssh/authorized_keys`, with the contents of
`~/cognify_deploy_key.pub` (from step 1) after the options:
```
command="bash /home/shesh/apps/cognify-staging/Oral_bot/deploy/deploy.sh",no-pty,no-port-forwarding,no-agent-forwarding,no-X11-forwarding ssh-ed25519 AAAA... github-deploy
```
Allow the deploy user to restart the one service without a password (`sudo visudo -f /etc/sudoers.d/cognify-deploy`):
```
shesh ALL=(root) NOPASSWD: /usr/bin/systemctl restart cognify-backend
```
(`which systemctl` shows the right path if it is not `/usr/bin/systemctl`.)

Make sure the app folder is on `main`: `git -C /home/shesh/apps/cognify-staging branch --show-current`.

**3. In GitHub** (repo, Settings, Secrets and variables, Actions, New repository secret) add four secrets:

| Name | Value |
|---|---|
| `VPS_SSH_KEY` | the whole contents of `~/cognify_deploy_key` (the private one) |
| `VPS_HOST` | `72.62.244.138` |
| `VPS_USER` | `shesh` |
| `VPS_KNOWN_HOSTS` | output of `ssh-keygen -F 72.62.244.138 -f ~/.ssh/known_hosts \| grep -v '^#'` (pins the server so nobody can impersonate it) |

Then delete the private key file from your computer, and run the workflow once by hand (Actions tab, Deploy Viva backend, Run workflow) to check it.

## If it breaks
- Red run, "Permission denied": the public key line in `authorized_keys` is wrong.
- "sudo: a password is required": the sudoers line is missing or the path to `systemctl` differs.
- "Host key verification failed": `VPS_KNOWN_HOSTS` is wrong or empty.
- Deploy ran but rolled back: the log shows why; usually a missing package or a Python error. See `sudo journalctl -u cognify-backend -n 50`.
- To redeploy by hand on the server: `bash /home/shesh/apps/cognify-staging/Oral_bot/deploy/deploy.sh`.
