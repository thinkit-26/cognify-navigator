# Cognify Navigator

The Cognify Institute web platform.

Built by **Abhay Kapoor** / **Briar**.

## AI Oral Viva — deployment

The AI Oral Viva feature (viva pages + FastAPI backend) requires deploying two
parts. Full, step-by-step instructions live in **[`VIVA_DEPLOYMENT.md`](VIVA_DEPLOYMENT.md)**.

In short: the frontend deploys to Cloudflare, and the Python backend in
`Oral_bot/backend` must be hosted separately (e.g. Render) because Cloudflare
Workers can't run FastAPI. Set `VITE_ORALBOT_BACKEND` + `VIVA_ACCESS_CODE` in the
Cloudflare build env and the Deepgram/Gemini keys + `CORS_ORIGINS` on the backend.

