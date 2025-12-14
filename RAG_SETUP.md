# RAG Trip Planner - Environment Setup

## Required Environment Variables

Add the following to your `.env` file:

```bash
# OpenAI API (for embeddings)
OPENAI_API_KEY=your_openai_api_key_here

# Gemini API (for trip generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Clerk Authentication (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add to `.env` as `OPENAI_API_KEY`

### Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key and add to `.env` as `GEMINI_API_KEY`

## Installation

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

## Verification

After starting the server, check the console for:
```
✅ Loaded 108 destinations from knowledge base
```

This confirms the RAG system is working correctly.

## Troubleshooting

### "Cannot find module 'openai'"
- Run `npm install openai`

### "OPENAI_API_KEY is not defined"
- Ensure `.env` file is in the root directory
- Restart the dev server after adding the key

### "Embedding knowledge base..." takes too long
- First request will embed all 108 destinations (~30-60 seconds)
- Subsequent requests will use cached embeddings
- Consider pre-embedding on server start for production
