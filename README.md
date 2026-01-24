<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UZkn2yQ00FQKWk45j4YJi-FFFnqSK-OD

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Provide a Gemini API key (either option):
   - Option A: create `.env.local` from `.env.example` and set `GEMINI_API_KEY`
   - Option B: run the app and add a key in the in-app AI assistant (stored in your browser)
3. Run the app:
   `npm run dev`

## Wallet Connect

The Create Invoice screen includes a **Connect Wallet** helper that can autofill your receiving BTC address from a compatible browser wallet extension (when available).
