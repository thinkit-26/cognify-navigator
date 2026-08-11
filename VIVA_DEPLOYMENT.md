# AI Oral Viva — Deployment Guide

The **AI Oral Viva** feature ships in two parts that must both be running for a
student to take a viva:

| Part | What it does | Where it runs |
|---|---|---|
| **Frontend** (this repo) | Renders the viva pages + the access-code gate | Cloudflare (Workers/Pages) |
| **Backend** (`Oral_bot/backend`) | Serves questions, transcribes speech, evaluates answers (FastAPI + Deepgram + Gemini) | A Python host — **NOT Cloudflare** |

> Cloudflare Workers cannot run Python/FastAPI, so the backend **must** be hosted
> on a separate service. Pushing this repo only deploys the frontend pages; the
> viva will not work until the backend is also live and the frontend points at it.

---

## 1. Deploy the backend (Render)

### 1.1 Create the service

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect your GitHub repo (`cognify-navigator`).
3. Set the root directory to: `Oral_bot/backend`
   - Render will auto-detect the `Procfile` (added to this repo) and run:
     `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Choose a **free** instance type (fine for testing).
5. Create the service. Render installs deps from `requirements.txt` and starts it.

### 1.2 Set environment variables

In the service's **Environment** tab, add:

| Variable | Value | Source |
|---|---|---|
| `DEEPGRAM_API_KEY` | your Deepgram key | `Oral_bot/backend/.env` |
| `GEMINI_API_KEY` | your Gemini key | `Oral_bot/backend/.env` |
| `CORS_ORIGINS` | `https://your-frontend-domain` | your deployed site URL |

`CORS_ORIGINS` is optional for local dev; in production set it to the exact URL
the site is served from (e.g. `https://app.cognify.in`). Multiple origins are
comma-separated.

After saving, Render redeploys automatically. The health check endpoint is
`GET /` → `{ "status": "Backend Running" }`. Note the service URL, e.g.
`https://cognify-oral-viva.onrender.com`.

---

## 2. Point the frontend at the backend

The frontend calls `http://127.0.0.1:8000` by default (your own machine). For the
deployed site you must override this at build time.

In the **Cloudflare** deployment settings (Workers/Pages build environment), set:

| Variable | Value |
|---|---|
| `VITE_ORALBOT_BACKEND` | `https://your-render-service.onrender.com` |
| `VIVA_ACCESS_CODE` | the access code (see below) |

Then redeploy the frontend.

### Access code (`VIVA_ACCESS_CODE`)

The gate verifies the code **server-side only** (it is never sent to the browser).

- Locally: it lives in the repo-root `.env.local` (`VIVA_ACCESS_CODE=...`).
- Production: set `VIVA_ACCESS_CODE` in the **Cloudflare** environment so the
  gate can verify it. The current local code is `476291` — change it in
  production if desired.

---

## 3. Verify end-to-end

With both the backend (Render) and frontend (Cloudflare) deployed:

1. Open the deployed site and click **Start AI Viva**.
2. Enter the access code → you should reach the topic/viva selection.
3. Pick a chapter/topic → start the viva → record a spoken answer.
4. After answering, confirm the transcript comes back (Deepgram) and the
   evaluation loads (Gemini) on the results page.

---

## 4. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Gate says "access code not configured" | `VIVA_ACCESS_CODE` missing on the server/Cloudflare | Set it in the Cloudflare env, redeploy |
| Chapters never load / network error | Frontend still calling `127.0.0.1:8000` | Set `VITE_ORALBOT_BACKEND` to the Render URL and redeploy |
| CORS error in the browser console | `CORS_ORIGINS` doesn't include your site | Add the exact origin to `CORS_ORIGINS` on Render, redeploy backend |
| "DEEPGRAM_API_KEY not found" / "GEMINI_API_KEY not found" | Keys not set on Render | Add them in the Render Environment tab |
| Transcript comes back empty | Microphone/recording issue | Check browser mic permission; re-record |

---

## 5. Running locally (for development)

**Backend** (terminal 1):
```powershell
cd Oral_bot/backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

**Frontend** (terminal 2):
```powershell
npm run dev
```
Then open `http://localhost:8080/viva/gate`. Keep `VIVA_ACCESS_CODE` in
`.env.local` and the Deepgram/Gemini keys in `Oral_bot/backend/.env`
(both files are gitignored — they never get committed).
