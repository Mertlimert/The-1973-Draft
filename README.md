# The 1973 Draft

An interactive generative web artwork built for CSE 358: Introduction to Artificial Intelligence.

Inspired by Bob Dylan's 1973 moodscape around "Knockin' on Heaven's Door", the project stages a farewell ritual: the user writes a single sentence about what they are leaving behind, and the system turns it into an archival anti-war poem, a judged revision, a music prompt, a generated song, and a shareable QR code.

## Concept

The experience is framed as a 1973 draft-office document.

The user answers:

> What are you leaving behind before going to war / into the unknown?

That response moves through a small agent pipeline:

1. Archive retrieval from a local 1973-inspired corpus
2. First-draft poem generation
3. Emotional review and revision
4. Music direction prompt generation
5. Full song lyric expansion for music generation
6. MiniMax music generation
7. QR generation for the returned audio URL

## Stack

- Frontend: Next.js, React, Tailwind CSS, Framer Motion
- Backend: FastAPI, Python
- Text + Music APIs: MiniMax
- Retrieval: local in-memory similarity search over a manual archive dataset

## Project Structure

```text
.
|-- backend
|   |-- app
|   |   |-- data
|   |   |   `-- seed_documents.py
|   |   |-- services
|   |   |   |-- ai_clients.py
|   |   |   |-- pipeline.py
|   |   |   |-- qr_code.py
|   |   |   `-- rag.py
|   |   |-- main.py
|   |   `-- schemas.py
|   `-- requirements.txt
`-- frontend
    |-- app
    |-- components
    |-- lib
    `-- package.json
```

## How It Works

### 1. Retrieval

The backend looks up the user's sentence against a local archive dataset and retrieves the most relevant records.

### 2. Poet Agent

A first-pass anti-war folk poem is generated in English using the retrieved context.

### 3. Judge Agent

The poem is reviewed for the emotional balance of grief, rebellion, and farewell.

### 4. Revision

The poem is revised into its final short form for display.

### 5. Song Expansion

The short poem is expanded into fuller song lyrics for MiniMax music generation, so the final track has a better chance of sounding like an actual song rather than a short fragment.

### 6. Music + QR

MiniMax returns either an audio URL or audio payload. The app renders a player and generates a QR code when a shareable URL is available.

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:8000`

## Environment Variables

### Backend

- `MINIMAX_API_KEY`
- `MINIMAX_TEXT_API_URL`
- `MINIMAX_TEXT_MODEL`
- `MINIMAX_LYRICS_API_URL`
- `MINIMAX_MUSIC_API_URL`
- `MINIMAX_MUSIC_MODEL`
- `MINIMAX_MUSIC_OUTPUT_FORMAT`
- `FRONTEND_ORIGIN`

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`

## RAG Dataset

The archive data is manually maintained in:

- [backend/app/data/seed_documents.py](backend/app/data/seed_documents.py)

If you want to add more letters, Dylan-adjacent fragments, research notes, anti-war diary excerpts, or 1973 bureaucratic language, add more entries to that list.

Current retrieval is implemented in:

- [backend/app/services/rag.py](backend/app/services/rag.py)

Right now this is a lightweight local similarity layer rather than a full ChromaDB runtime, chosen to keep Windows setup simple and reliable in this repo version.

## Notes

- The UI is styled as a vintage military bureaucracy document from 1973.
- The loading state, form surface, and final result page are all designed as archival document artifacts.
- If MiniMax does not return a usable music output, the app falls back gracefully instead of crashing.
- `.env` files are intentionally excluded from version control.

## Demo Flow

1. Enter one sentence
2. Wait while the archive / poet / judge / composer stages run
3. Read the final poem
4. Play the generated track
5. Scan the QR code when an external audio URL is returned
