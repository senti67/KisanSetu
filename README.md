# KisanSetu — Mandi Gate Pass & MSP Portal

KisanSetu is a farmer-facing React/TanStack Start portal with mandi discovery,
gate-pass booking, MSP information, payment estimation, moisture guidance,
multilingual UI, voice search, and the Kisan Mitra AI assistant.

## AI backend

Kisan Mitra uses a server-side `/api/chat` route and Google's Gemini API.
The Gemini API key is read only on the server from:

```text
GEMINI_API_KEY
```

The key is never included in frontend code.

Google's Gemini API provides an OpenAI-compatible endpoint, so this project
uses the existing `@ai-sdk/openai-compatible` dependency rather than adding
another AI SDK package.

## Run locally

```sh
npm install
npm run dev
```

Create a local `.env` file:

```text
GEMINI_API_KEY=your_actual_key
```

Then open the local URL printed by Vite.

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Keep the detected TanStack Start/Vite build settings unless Vercel reports
   a specific configuration error.
4. In Vercel, open **Project Settings → Environment Variables**.
5. Add:

```text
Name: GEMINI_API_KEY
Value: your actual Google Gemini API key
```

6. Enable it for the environment(s) you deploy to.
7. Redeploy.

The frontend and the `/api/chat` server route are deployed as part of the
TanStack Start application.

## Security

Never commit the real Gemini API key to GitHub and never put it in a
`VITE_*` variable. The browser should call `/api/chat`; the server route
uses `GEMINI_API_KEY`.
