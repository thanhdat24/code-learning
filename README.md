<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1N4foqdNNRqtuRNX8PtYVSyV3D_M_5jqU

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Configure MongoDB (server-side)
   - Create `server/.env` from `server/.env.example` and paste your MongoDB Atlas connection string.
   - Ensure the Atlas user has read/write access to the target database (default: `CodeMaster`).
4. Run the app (client + API server):
   `npm run dev`

The client calls `/api/...` and Vite proxies those requests to the local Express server on port `3001`.
