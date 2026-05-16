# PhotoKingShot by GKC Productions

Production-minded first version of the public PhotoKingShot photography website and simple admin dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Server actions
- Simple `ADMIN_PASSWORD` admin protection

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/photokingshot"
ADMIN_PASSWORD="use-a-long-private-password"
NEXT_PUBLIC_SITE_URL="https://photokingshot.com"
```

4. Generate Prisma client and create database tables:

```bash
npx prisma generate
npx prisma migrate dev
```

5. Run locally:

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Blog Draft Automation

Generate six static draft placeholders:

```bash
npm run generate:blog-drafts
```

The script does not call any AI API yet. Comments in `scripts/generate-blog-drafts.ts` mark where OpenAI API or Twin AI integration can be added later.

## Admin

Visit `/admin` and sign in with `ADMIN_PASSWORD`.

The first version uses simple server-side password cookie protection. Future production auth can replace this with NextAuth or Clerk for users, roles, password resets, and audit trails.

Admin can:

- View booking inquiries
- Create, edit, and delete blog posts
- Mark blog posts as `DRAFT` or `PUBLISHED`
- Create private client galleries with gallery code/password login
- Add gallery image URLs and control download availability
- Create, edit, and delete gear recommendations
- Create, edit, and delete portfolio items

## Client Galleries

Client galleries live at `/galleries`. They are private and require the gallery code and password created in admin.

Admin workflow:

1. Go to `/admin/galleries`.
2. Create a gallery with a title, client/session name, access code, and one-time password.
3. Copy and share the password with the client when you create or reset it. Passwords are hashed and cannot be viewed later.
4. Add image URLs from `/admin/galleries/[id]/images`, or upload a prepared local gallery to private Cloudflare R2 with a script.
5. Publish the gallery when it is ready for the client.

Production gallery delivery can use private Cloudflare R2. With public bucket access disabled, the site serves thumbnails, previews, and downloads through authenticated Next.js routes after the client logs in. Add these environment variables on the server:

```bash
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="photokingshot-galleries"
R2_PUBLIC_BASE_URL=""
```

Alexis Kofi's graduation gallery can be uploaded from local originals with:

```bash
npm run gallery:upload-r2:alexis
```

The script uploads originals, generates 600px thumbnails and 1400px previews with Sharp, then updates the existing `GalleryImage` rows with R2 object keys. Local `imageUrl` values stay in the database as a fallback.

Optional sample seed:

```bash
npx tsx scripts/seed-sample-gallery.ts
```

The sample gallery is unpublished by default and should not be auto-run in production.

## Ubuntu + Nginx + PM2 Deployment Notes

1. Install Node.js LTS, PostgreSQL, Nginx, and PM2 on the server.

```bash
npm install -g pm2
```

2. Create the PostgreSQL database and user.

3. Clone or upload this project to the server.

4. Add production `.env` with:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/photokingshot"
ADMIN_PASSWORD="use-a-long-private-password"
NEXT_PUBLIC_SITE_URL="https://photokingshot.com"
```

5. Install, migrate, and build:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

6. Start with PM2:

```bash
pm2 start npm --name photokingshot -- start
pm2 save
pm2 startup
```

7. Configure Nginx as a reverse proxy to the Next.js port, commonly `3000`.

```nginx
server {
    server_name photokingshot.com www.photokingshot.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. Add TLS with Certbot, then reload Nginx.

```bash
sudo nginx -t
sudo systemctl reload nginx
```
