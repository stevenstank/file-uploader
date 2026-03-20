# File Uploader App

Simple file upload and sharing app with folders and expiring links.

## Features

- User authentication (register, login, logout)
- Upload files to Cloudinary
- Organize files into folders
- Share folders with expiring public links
- Download-only behavior for private and shared files
- Drag-and-drop file selection with upload progress

## Tech Stack

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- EJS
- Cloudinary
- Passport + express-session

## Project Structure

- `controllers/` request handlers
- `routes/` route definitions
- `views/` EJS templates
- `prisma/` schema and migrations
- `public/` client-side assets

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="your_session_secret"

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

PORT=3000
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client

```bash
npx prisma generate
```

3. Apply database migrations

```bash
npx prisma migrate dev
```

4. Start app

```bash
npm run dev
```

Production start:

```bash
npm start
```

## Render Deployment

### 1. Create a Web Service

- Connect this repository in Render
- Runtime: Node

### 2. Build and Start Commands

- Build command:

```bash
npm install
```

- Start command:

```bash
npm start
```

`postinstall` runs `prisma generate` automatically.

### 3. Set Environment Variables in Render

- `DATABASE_URL`
- `SESSION_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NODE_ENV=production`

### 4. Database

- Use a PostgreSQL database (Render Postgres or external)
- Run migrations during deployment or before first start:

```bash
npx prisma migrate deploy
```

## Notes

- Files are stored in Cloudinary and URLs are saved in the database.
- App is configured to use `process.env.PORT` for deployment.
- Local `uploads/` static serving is not required for cloud-based file storage.

## Author

stevenstank

GitHub: https://github.com/stevenstank