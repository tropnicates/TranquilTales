# TranquilTales

TranquilTales is a blog app with an Express JSON API and a React single-page frontend built with Vite. MongoDB stores users, posts, and comments; Cloudinary stores uploaded images.

## Requirements

- Node.js 24 (also pinned by `.node-version` and required by `package.json`)
- MongoDB
- Cloudinary credentials for image uploads

## Setup

1. Copy `.env.example` to `.env` and set `MONGO_URL`, `SESSION_KEY`, and the Cloudinary credentials.
2. Install dependencies with `npm install`.
3. Run the Express API and Vite frontend together with `npm run dev`.
4. Open `http://localhost:5173`.

The API is available at `http://localhost:9000/api/v1`. Vite proxies `/api` and `/images` to Express during local development.

## Production

Run `npm run build` to generate the React app in `dist`. Set `NODE_ENV=production` and start the Express server with `npm start`; Express serves the built frontend and API from the same origin.

## Host on Render

The included `render.yaml` configures one Render web service for both the React UI and Express API. The free plan is suitable for trying the app; it may sleep when idle, so the first visit after a quiet period can take a little longer.

1. Create a MongoDB Atlas database and a Cloudinary account. In Atlas, allow connections from Render (for a quick demo you can allow access from anywhere, then tighten the network rule later). Keep the MongoDB connection string and Cloudinary credentials private.
2. In Render, choose **New → Blueprint**, connect `tropnicates/TranquilTales`, and select the `release-final` branch. Render reads `render.yaml`; enter the requested `MONGO_URL`, `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, and `CLOUDINARY_SECRET_KEY` values. Render generates `SESSION_KEY`.
3. Apply the Blueprint and wait for the service's first deploy to finish. Open the service's public `onrender.com` URL to see the app.
4. In the Render service settings, create a **Deploy Hook** and copy its URL. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret**. Name it `RENDER_DEPLOY_HOOK_URL` and paste the hook URL as its value. Do not put credentials in the repository or a commit.
5. Push a commit to `release-final`. GitHub Actions runs the build and backend syntax checks. If they pass, the workflow triggers Render to deploy. You can follow the checks in the repository's **Actions** tab and the deployment in Render's **Events/Logs**. You can also manually run **Actions → Release final → Run workflow** on `release-final`.

The initial Blueprint creates the Render service. Later deployments are deliberately triggered by the GitHub Actions workflow after validation, rather than automatically on every Git push. If the GitHub secret is not set yet, validation still runs and the deploy step reports that deployment was skipped.

For an existing Render service, make sure its **Branch** is `release-final`, its **Build Command** is `npm ci && npm run build`, and its **Start Command** is `npm start`. The repository pins Node.js 24 for Render and CI. If a deploy reports `vite: not found`, redeploy the latest commit after confirming the service is using this branch and build command.

This app uses MongoDB for persistent user/post/comment data and Cloudinary for uploaded images. Render's free web service can sleep, but the MongoDB and Cloudinary accounts are separate services with their own limits and terms.
Image uploads are limited to 5 MB and accept JPEG or PNG files.

More information: [Render Blueprints](https://render.com/docs/blueprint-spec), [Render deploy hooks](https://render.com/docs/deploy-hooks), [GitHub Actions secrets](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions), and [MongoDB Atlas](https://www.mongodb.com/atlas).

## Features

- Register, sign in, and session-based authentication
- Create, edit, and delete posts with image uploads
- Read posts and add, edit, or delete comments
- Update profile details, password, profile image, and cover image
