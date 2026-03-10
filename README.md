# Poetry Sharing

A simple poetry sharing website built with Next.js, Tailwind CSS, and InstantDB.

## Features

- Magic code authentication (sign up / log in via email)
- Post poems (title and body)
- Home page shows all poems from all users, newest first

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add your InstantDB App ID:
   ```bash
   cp .env.example .env.local
   # Edit .env.local: NEXT_PUBLIC_INSTANT_APP_ID=your-app-id
   ```

3. Push the schema to your InstantDB app (requires [Instant CLI](https://instantdb.com/docs)):
   ```bash
   npx instant-cli login   # if not already logged in
   npx instant-cli push    # pushes instant.schema.ts to your app
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push your code to GitHub and import the project in [Vercel](https://vercel.com).

2. Add the environment variable in Vercel Project Settings > Environment Variables:
   - **Name:** `NEXT_PUBLIC_INSTANT_APP_ID`
   - **Value:** Your InstantDB App ID (e.g. `e6b5e060-84c4-4d50-8811-2496fc92b71c`)

3. Deploy. Vercel auto-detects Next.js and uses `next build` as the build command.
