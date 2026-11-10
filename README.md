# TranquilTales

TranquilTales is a blog app with an Express JSON API and a React single-page frontend built with Vite. MongoDB stores users, posts, and comments; Cloudinary stores uploaded images.

## Requirements

- Node.js 18 or newer
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

## Features

- Register, sign in, and session-based authentication
- Create, edit, and delete posts with image uploads
- Read posts and add, edit, or delete comments
- Update profile details, password, profile image, and cover image
