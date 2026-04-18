# SilkSphere AI Backend

FastAPI backend serving the silkworm disease detection model.

## Deploy on Railway (recommended)

1. Go to https://railway.app and create a new project
2. Connect this GitHub repo, set root directory to `backend`
3. Railway auto-detects Python — it will run `uvicorn backend.main:app`
4. Copy the deployed URL and set it as `VITE_BACKEND_URL` in Vercel

## Run locally

```bash
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

API runs at http://127.0.0.1:8000
