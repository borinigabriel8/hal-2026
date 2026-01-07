## Repo context

- Purpose: small HAL-style chat UI that calls a local Express backend which forwards prompts to a Hugging Face inference API.
- Key files:
  - `server.js` — Express backend; exposes POST /chat and forwards `req.body.message` to the HF model. Server listens on port 4000.
  - `script.js` — Frontend logic; posts JSON { message } to `http://localhost:4000/chat` and displays the reply.
  - `index.html` — Minimal client UI (open locally in a browser while `npm start` runs the backend).
  - `package.json` — ESM project (`"type": "module"`) with start script `node server.js`.

## How this project runs (developer workflow)

- Install and run:
  - Run `npm install` to install dependencies.
  - Start the backend with `npm start` (runs `node server.js`).
  - Open `index.html` in the browser (file:// is fine) and interact with the UI while the server is running.

- Notes for debugging:
  - The backend logs to console; watch terminal running `npm start` for errors and responses from HF.
  - The backend uses CORS, so the browser-based frontend can call `http://localhost:4000`.

## Important project-specific constraints and conventions

- ESM modules: `package.json` sets `"type": "module"`. Use `import`/`export` and avoid CommonJS `require()`.
- The backend uses `node-fetch` and expects modern Node/EJS setup. Keep imports consistent with ESM.
- Secrets: `HF_TOKEN` is currently hard-coded in `server.js`. Preferred pattern: replace the literal with `process.env.HF_TOKEN` and set the secret locally (or via dotenv) when modifying code.

## API surface and examples (use these exact shapes)

- Backend endpoint:
  - POST http://localhost:4000/chat
  - Request body: { "message": "<user prompt>" }
  - Response body: { "reply": "<generated text>" }

- Example use (pseudo):
  - Frontend sends: { message: "Explique IA em poucas palavras" }
  - Backend forwards that string as the `inputs` payload to Hugging Face and returns `data[0].generated_text` inside `{ reply }`.

## What to watch for when editing

- Keep `server.js` as an ESM file (named `server.js` but using `import`); do not convert it to CommonJS.
- When changing the HF integration:
  - Preserve the expected JSON shape returned to the frontend (`{ reply: string }`). The client expects `data.reply`.
  - Validate `data[0]?.generated_text` before returning it; the current code uses a fallback string when undefined.
- If you add static serving of the frontend from Express, update `index.html` paths and remove CORS if serving from same origin.

## Quick tasks and examples for agents

- To run and test a change to the backend handler:
  1. Edit `server.js` (use `process.env.HF_TOKEN` for tokens).
  2. In terminal: `npm install` (if adding deps) and `npm start`.
  3. Use curl or the browser UI to POST: `curl -X POST http://localhost:4000/chat -H "Content-Type: application/json" -d '{"message":"hello"}'`

- To update the frontend test flow:
  - The client posts to `http://localhost:4000/chat` and expects `{ reply }`. Keep that contract.

## Files to reference when coding

- `server.js` — primary backend logic (HF token, fetch call to HF inference API). Modify here for model or provider changes.
- `script.js` — client-side expectations (JSON shape and UI flow).
- `package.json` — run scripts and ESM mode.

If any part of this summary is unclear or you'd like more detail (e.g., recommended env handling, adding a dev proxy, or examples to mock the HF response for tests), tell me which area and I'll expand the file accordingly.
