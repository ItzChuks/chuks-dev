# Chuks Portfolio — Setup Guide

## Files
```
portfolio/
├── index.html      → Main portfolio page
├── admin.html      → Project upload dashboard
├── style.css       → Shared styles (dark/light theme)
├── admin.css       → Admin-only styles
├── main.js         → Portfolio animations & logic
├── projects.js     → Fetches & renders projects from Appwrite
├── admin.js        → Admin login, CRUD operations
└── appwrite.js     → Appwrite SDK config (edit this first)
```

---

## Step 1 — Create an Appwrite Project

1. Go to https://cloud.appwrite.io and sign up / log in
2. Create a new **Project** → copy the **Project ID**
3. Go to **Settings → Platforms** → Add platform → **Web**
   - Add your domain (e.g. `yourdomain.com` or `localhost`)
   - Also add `127.0.0.1` for local testing

---

## Step 2 — Create a Database & Collection

1. Go to **Databases** → Create database → copy **Database ID**
2. Create a **Collection** called `projects` → copy **Collection ID**
3. Add these **Attributes** to the collection:

| Attribute  | Type   | Required |
|------------|--------|----------|
| title      | String | Yes      |
| stack      | String | Yes      |
| description| String | No       |
| liveUrl    | String | No       |
| githubUrl  | String | No       |
| imageId    | String | No       |

4. Under **Settings** → set **Read** permission to `Any` so the portfolio can fetch projects publicly

---

## Step 3 — Create a Storage Bucket

1. Go to **Storage** → Create bucket called `project-images` → copy **Bucket ID**
2. Set **Read** permission to `Any`
3. Set **Max File Size** to `5MB`, allowed types: `image/*`

---

## Step 4 — Create an Admin User

1. Go to **Auth** → **Users** → Create user
2. Enter your email and a strong password
3. This is what you'll use to log in to `admin.html`

---

## Step 5 — Update appwrite.js

Open `appwrite.js` and replace the placeholder values:

```js
const APPWRITE_CONFIG = {
  endpoint:     'https://cloud.appwrite.io/v1',
  projectId:    'PASTE_YOUR_PROJECT_ID',
  databaseId:   'PASTE_YOUR_DATABASE_ID',
  collectionId: 'PASTE_YOUR_COLLECTION_ID',
  bucketId:     'PASTE_YOUR_BUCKET_ID',
};
```

---

## Step 6 — Personalise index.html

Search for these placeholders and update them:

- `chuks@email.com` → your real email
- Social links (`href="#"`) → your GitHub, LinkedIn, Twitter URLs
- Demo projects in `projects.js` → will auto-hide once you add real ones

---

## Step 7 — Deploy

**Vercel (recommended):**
1. Push all files to a GitHub repo
2. Import the repo on https://vercel.com
3. Deploy — done!

**Important:** After deploy, add your Vercel domain in Appwrite Console:
`Settings → Platforms → Web → Add your-portfolio.vercel.app`

---

## Using the Admin Panel

- Go to `yoursite.com/admin.html`
- Log in with your Appwrite user credentials
- Use **Add Project** to upload:
  - Project name, tech stack, description
  - Live URL and GitHub link
  - Screenshot image (auto-uploaded to Appwrite Storage)
- Click any project in the list to **edit or delete** it
- Changes appear live on your portfolio instantly

---

## Customisation Tips

| What | Where |
|------|-------|
| Your name | `index.html` line 1 (title) and hero section |
| Typed roles | `main.js` → `roles` array |
| Tech badges | `main.js` → `techBadges` array |
| Accent colour | `style.css` → `--accent: #6C63FF` |
| Skill percentages | `index.html` → `data-width` attributes |
| Stats (4+, 20+) | `index.html` → stat cards in about section |
