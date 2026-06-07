---
title: NIDAN AI Backend
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# NIDAN AI

Medical image segmentation app with a Vite React frontend and FastAPI/TensorFlow backend.

## Frontend: Vercel

Deploy the `frontend` directory as a Vercel project.

- Framework preset: Vite
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://prshntdxt-nidan-ai.hf.space`

## Backend: Hugging Face Spaces

Create a Hugging Face Space with Docker SDK and push this repository to the Space.

Backend Space repo:

```text
https://huggingface.co/spaces/prshntdxt/nidan_ai
```

Backend API URL:

```text
https://prshntdxt-nidan-ai.hf.space
```

The Space uses:

- `Dockerfile`
- `backend/main.py`
- `backend/inference.py`
- the `.keras` model files downloaded from GitHub LFS during the Docker build

The model files are intentionally not stored in the Space repository because the
Space Git repository has a 1 GB storage limit and the three weights are about
1.6 GB total.

Set this runtime variable in the Space settings after the Vercel deployment is live:

```text
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

Use `*` only while testing.

## API

- `GET /health`
- `GET /models`
- `POST /predict`
