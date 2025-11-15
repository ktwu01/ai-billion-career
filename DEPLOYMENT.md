# GitHub Pages Deployment Guide

This project is configured to automatically deploy to GitHub Pages using GitHub Actions. Every time you push to the `main` branch, your site is automatically built and deployed.

---

## ✅ Current Configuration Status

Your project needs to be configured for GitHub Pages deployment:

- ⏳ **GitHub Actions workflow** (`.github/workflows/deploy.yml`) - **TO BE CREATED**
- ✅ **Vite build configured** (`vite.config.ts`)
- ⏳ **Base path configuration** - **TO BE CONFIGURED**
- ✅ **React SPA with client-side routing**
- ✅ **Supabase backend** (runs independently from static hosting)

---

## 🚀 Complete Deployment Steps

### Step 1: Configure Vite for GitHub Pages

First, we need to configure the base path in `vite.config.ts` to match your repository name:

```typescript
// ai-career-dashboard/vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-info'

const isProd = process.env.BUILD_MODE === 'prod'
export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ],
  base: '/ai-billion-career/', // Add this line - matches your repo name
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### Step 2: Create GitHub Actions Workflow

Create the file `.github/workflows/deploy.yml` in your repository root:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: ai-career-dashboard/package-lock.json

      - name: Install dependencies
        working-directory: ./ai-career-dashboard
        run: npm ci

      - name: Build
        working-directory: ./ai-career-dashboard
        run: npm run build:prod

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./ai-career-dashboard/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Add SPA Fallback for Client-Side Routing

Create a `404.html` file in `ai-career-dashboard/public/` directory:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Billion Career</title>
  <script>
    // Single Page Apps for GitHub Pages
    // https://github.com/rafgraph/spa-github-pages
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/ai-billion-career/'"></meta>
</head>
<body>
</body>
</html>
```

Update your `ai-career-dashboard/index.html` to handle redirects:

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Billion Career</title>
  <script>
    // Single Page Apps for GitHub Pages redirect handling
    (function(l) {
      if (l.search[1] === '/' ) {
        var decoded = l.search.slice(1).split('&').map(function(s) {
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>

</html>
```

### Step 4: Enable GitHub Pages (One-Time Setup)

1. Go to your repository on GitHub
2. Click **Settings** (top navigation bar)
3. Click **Pages** (left sidebar, under "Code and automation")
4. Under **"Build and deployment"** section:
   - **Source**: Click the dropdown
   - Select **"GitHub Actions"** (NOT "Deploy from a branch")
5. Click **Save** (if there's a save button)

**What this does:** Tells GitHub to use your `.github/workflows/deploy.yml` file to build and deploy your site.

---

### Step 5: Configure Supabase Environment Variables

**IMPORTANT:** Your Supabase credentials are currently hardcoded in `src/lib/supabase.ts`. While the anon key is safe to expose publicly (it's client-side only), it's better practice to use environment variables.

However, for GitHub Pages deployment, the current approach will work because:
- The anon key is designed to be used in client-side code
- Row Level Security (RLS) in Supabase protects your data
- The actual security is enforced on the Supabase backend

**No action needed for now**, but for future improvements, consider:
1. Moving credentials to environment variables
2. Setting up Supabase RLS policies properly
3. Using GitHub Secrets for sensitive configuration

---

### Step 6: Push Your Code

Every time you push to the `main` branch, deployment happens automatically:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**What happens next:**
1. GitHub detects the push to `main`
2. Triggers the "Deploy to GitHub Pages" workflow
3. Builds your Vite + React app as static files
4. Deploys to GitHub Pages
5. Your site updates in 2-3 minutes

---

### Step 7: Monitor Deployment

1. Go to your repository on GitHub
2. Click the **Actions** tab (top navigation)
3. You'll see the workflow run: **"Deploy to GitHub Pages"**
4. Click on it to see detailed logs
5. Wait for the green checkmark ✅ (usually 2-3 minutes)

**Status indicators:**
- 🟡 **Yellow dot** = Running
- ✅ **Green checkmark** = Success (your site is live!)
- ❌ **Red X** = Failed (check the logs for errors)

---

### Step 8: Access Your Live Site

Once deployment succeeds, your site is available at:

**Main URL:**
```
https://<your-github-username>.github.io/ai-billion-career/
```

**Note:** Your Supabase backend runs independently, so all authentication and database features will work as expected.

---

## 🔧 How It Works (Technical Details)

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` file contains the automated deployment process:

1. **Trigger:** Runs on every push to `main` branch (or manual trigger)
2. **Build Process:**
   - Checks out your code
   - Sets up Node.js 20
   - Installs dependencies with `npm ci`
   - Builds the static site with `npm run build:prod`
   - Generates the `dist/` directory with all HTML/CSS/JS
3. **Deploy Process:**
   - Uploads the `dist/` directory as an artifact
   - Deploys to GitHub Pages
   - Makes your site live

### Vite Configuration

The `vite.config.ts` file needs to be configured for GitHub Pages:

```js
base: '/ai-billion-career/', // Matches your GitHub repo name
```

This ensures all asset paths are correctly prefixed with your repository name.

---

## 📂 Build Output Structure

After running `npm run build:prod`, the `dist/` directory contains:

```
dist/
├── index.html           # Main entry point
├── 404.html            # SPA fallback for routing
├── assets/             # JavaScript, CSS bundles
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
├── favicon.png
└── [other static assets]
```

GitHub Pages serves these files directly from the `dist/` directory.

### Architecture Notes

This is a **Single Page Application (SPA)** architecture:
- All routes are handled client-side by React Router
- The `404.html` ensures deep links work on GitHub Pages
- Supabase handles all backend functionality (auth, database, storage)
- No server-side rendering - everything runs in the browser

---

## 🎯 Automatic Deployment Features

### What Triggers Deployment

✅ **Push to main branch** - Automatic
✅ **Manual trigger** - Go to Actions > Deploy to GitHub Pages > Run workflow
❌ **Pull requests** - Does NOT deploy (only builds for testing)
❌ **Other branches** - Does NOT deploy

### Deployment Permissions

The workflow has these permissions (configured in `deploy.yml`):
- `contents: read` - Read your repository code
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - Required for Pages authentication

These are automatically granted by GitHub, no manual setup needed.

---

## 🐛 Troubleshooting

### Deployment Fails

1. **Check Actions logs:**
   - Go to Actions tab
   - Click on the failed workflow run
   - Expand the failed step to see error messages

2. **Common issues:**
   - **Build errors:** Fix TypeScript/lint errors in your code
     ```bash
     cd ai-career-dashboard
     npm run lint
     npm run build:prod
     ```
   - **Permission denied:** Make sure GitHub Pages is enabled in Settings
   - **404 on deployment:** Verify `base` path in `vite.config.ts` matches your repo name
   - **Missing package-lock.json:** Run `npm install` to generate it

### Site Shows 404 Error

1. **Verify GitHub Pages is enabled:**
   - Settings > Pages > Source = "GitHub Actions"

2. **Check deployment status:**
   - Actions tab should show successful deployment

3. **Verify URL structure:**
   - Correct: `https://username.github.io/ai-billion-career/`
   - Wrong: `https://username.github.io/` (missing repo name)

4. **Check base path in vite.config.ts:**
   ```typescript
   base: '/ai-billion-career/', // Must match repo name exactly
   ```

### CSS/JavaScript Not Loading

If you see errors like "Failed to load resource" in browser console:

1. **Check browser console** for 404 errors on asset files
2. **Verify base path** in `vite.config.ts` matches repo name exactly
3. **Clear browser cache** and hard refresh (Cmd/Ctrl + Shift + R)
4. **Test build locally:**
   ```bash
   cd ai-career-dashboard
   npm run build:prod
   npm run preview
   ```

### Routing Issues (404 on page refresh)

If direct URLs like `/dashboard` show 404:

1. **Verify 404.html exists** in `ai-career-dashboard/public/`
2. **Check the redirect script** in `index.html` is present
3. **Test locally** with the preview command

### Supabase Connection Issues

If you see authentication or database errors:

1. **Check Supabase project status** at supabase.com
2. **Verify credentials** in `src/lib/supabase.ts`
3. **Check browser console** for CORS errors
4. **Verify Supabase URL** in allowed origins (Supabase Dashboard > Settings > API)

### Changes Not Appearing

1. **Wait 2-3 minutes** after deployment succeeds
2. **Hard refresh** your browser (Cmd/Ctrl + Shift + R)
3. **Check Actions tab** to confirm latest deployment succeeded
4. **Verify you pushed to `main` branch:** `git branch` should show `* main`
5. **Clear browser cache completely** or test in incognito mode

---

## 🔄 Making Updates

### Standard Workflow

1. Make your code changes locally in the `ai-career-dashboard/` directory
2. Test locally:
   ```bash
   cd ai-career-dashboard
   npm run dev  # Test in development mode
   ```
3. Build and preview production build:
   ```bash
   npm run build:prod
   npm run preview
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "Your descriptive message"
   git push origin main
   ```
5. Wait 2-3 minutes for automatic deployment
6. Verify changes on live site

### Testing Before Deployment

**Local development (recommended for most changes):**
```bash
cd ai-career-dashboard
npm run dev
```
Visit: http://localhost:5173

**Test production build locally:**
```bash
cd ai-career-dashboard
npm run build:prod
npm run preview
```
Visit: http://localhost:4173

**Important:** The preview server doesn't perfectly simulate GitHub Pages' base path behavior. Test thoroughly after deploying to catch any path-related issues.

---

## 📊 Monitoring Deployments

### Check Recent Deployments

1. Go to **Actions** tab
2. See history of all workflow runs
3. Each run shows:
   - Commit message that triggered it
   - Time it ran
   - Duration
   - Status (success/failure)

### View Live Site Status

After deployment succeeds:
1. Go to **Settings > Pages**
2. You'll see: "Your site is live at [URL]"
3. Click "Visit site" to open in new tab

### Environments

GitHub creates a "github-pages" environment automatically:
1. Go to your repository home page
2. Look in the right sidebar under "Environments"
3. Click "github-pages" to see deployment history
4. Shows timestamps of each deployment

---

## 🌐 Custom Domain (Optional)

If you want to use your own domain instead of `github.io`:

### Add Custom Domain

1. Go to **Settings > Pages**
2. Under **"Custom domain"**, enter your domain (e.g., `career.example.com`)
3. Click **Save**
4. Add DNS records at your domain registrar:
   - **For apex domain (example.com):**
     - Add A records pointing to GitHub's IPs:
       - `185.199.108.153`
       - `185.199.109.153`
       - `185.199.110.153`
       - `185.199.111.153`
   - **For subdomain (career.example.com):**
     - Add CNAME record pointing to `<username>.github.io`

5. Wait for DNS propagation (up to 24 hours)
6. GitHub will automatically issue an SSL certificate
7. Enable "Enforce HTTPS" in Settings > Pages

### Update Configuration

After adding custom domain, update `vite.config.ts`:

```typescript
// Remove the base path for custom domain
base: '/', // Changed from '/ai-billion-career/'
```

Also update the 404.html file:

```html
<meta http-equiv="refresh" content="0;URL='/'"></meta>
```

Then rebuild and push:
```bash
cd ai-career-dashboard
npm run build:prod
git add .
git commit -m "Configure for custom domain"
git push origin main
```

---

## 💡 Best Practices

### Commit Messages

Use clear, descriptive commit messages:
```bash
# Good
git commit -m "feat: Add career goal tracking feature"
git commit -m "fix: Resolve authentication redirect issue"
git commit -m "style: Update dashboard card layout for mobile"
git commit -m "docs: Update deployment documentation"

# Avoid
git commit -m "fix"
git commit -m "updates"
git commit -m "changes"
```

### Testing Before Deployment

Always test locally before pushing:
```bash
cd ai-career-dashboard
npm run lint            # Check for TypeScript/lint errors
npm run build:prod      # Ensure build succeeds
npm run preview         # Test the production build
```

### Environment Variables

Keep sensitive data secure:
- Never commit `.env` file (already in `.gitignore`)
- Use `.env.example` to document required variables
- For GitHub Pages, hardcoded values are OK for public anon keys
- For production apps with secrets, use a different hosting platform (Vercel, Netlify)

### Branch Protection (Optional)

For team projects, protect the main branch:
1. Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Enable "Require status checks to pass before merging"
4. Enable "Require branches to be up to date before merging"

### Supabase Best Practices

1. **Enable Row Level Security (RLS)** on all tables
2. **Set up proper policies** for authenticated users
3. **Use service role key** only in backend/server code (never in client)
4. **Monitor usage** in Supabase Dashboard to avoid hitting free tier limits

---

## 📈 Performance & Optimization

Your Vite + React app is optimized for GitHub Pages:

✅ **Vite build optimization** - Fast builds, optimized bundles
✅ **Code splitting** - JavaScript split into chunks for faster loading
✅ **Global CDN** - GitHub serves from edge locations worldwide
✅ **Compressed assets** - CSS and JS are minified and compressed
✅ **React** - Efficient rendering and updates
✅ **Supabase** - Fast backend with global edge network

### Loading Times

Expected performance:
- **First load:** 1-3 seconds (includes downloading React, UI libraries, and connecting to Supabase)
- **Subsequent visits:** < 1 second (browser cache + service worker potential)
- **Page interactions:** Instant (client-side React)
- **Database queries:** 100-500ms (depends on Supabase region)

### Optimization Tips

1. **Lazy load routes** - Use React.lazy() for code splitting
2. **Optimize images** - Compress images before adding to repo
3. **Monitor bundle size** - Run `npm run build:prod` and check dist/ size
4. **Use Supabase edge functions** - For complex queries, use database functions
5. **Enable Supabase caching** - Configure cache headers in Supabase

---

## 🔐 Security

### HTTPS

GitHub Pages enforces HTTPS automatically:
- ✅ All traffic encrypted
- ✅ Free SSL certificate
- ✅ Automatic renewal
- ✅ Cannot be disabled for `github.io` domains

### Data Security

Your app uses Supabase for data storage:
- ✅ **HTTPS encryption** - All API calls encrypted
- ✅ **Row Level Security (RLS)** - Database-level access control
- ✅ **Authentication** - Supabase handles auth securely
- ✅ **Anon key is safe** - Public key with RLS protection
- ⚠️ **Never expose service role key** - Keep it secret, server-side only

### Security Checklist

Before going to production:
1. [ ] Enable RLS on all Supabase tables
2. [ ] Create proper RLS policies for each table
3. [ ] Test authentication flow thoroughly
4. [ ] Review CORS settings in Supabase
5. [ ] Set up email verification for users
6. [ ] Configure password requirements
7. [ ] Enable MFA (Multi-Factor Authentication) option
8. [ ] Set up monitoring and alerts in Supabase

### Current Security Status

Based on your code:
- ⚠️ Supabase credentials are hardcoded (OK for anon key, but consider env vars)
- ✅ Using HTTPS for all requests
- ❓ RLS status unknown - check Supabase dashboard

---

## 📝 Summary

**Your deployment workflow is:**

1. Make code changes locally in `ai-career-dashboard/`
2. Test locally with `npm run dev`
3. Push to `main` branch
4. GitHub Actions automatically builds and deploys
5. Site updates in 2-3 minutes
6. Users access at: `https://<username>.github.io/ai-billion-career/`

**Key files to create/modify:**
- `.github/workflows/deploy.yml` - Deployment automation (CREATE THIS)
- `ai-career-dashboard/vite.config.ts` - Add base path configuration
- `ai-career-dashboard/public/404.html` - SPA fallback (CREATE THIS)
- `ai-career-dashboard/index.html` - Add redirect handling script

**Configuration checklist:**
1. [ ] Add `base: '/ai-billion-career/'` to vite.config.ts
2. [ ] Create `.github/workflows/deploy.yml` workflow file
3. [ ] Create `public/404.html` for SPA routing
4. [ ] Update `index.html` with redirect script
5. [ ] Enable GitHub Pages in repository settings
6. [ ] Push to main branch and verify deployment

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Actions logs** for error messages
2. **Review this guide** for configuration steps
3. **Test locally:**
   ```bash
   cd ai-career-dashboard
   npm run build:prod
   npm run preview
   ```
4. **Check GitHub Status:** https://www.githubstatus.com/
5. **GitHub Pages docs:** https://docs.github.com/en/pages
6. **Vite docs:** https://vitejs.dev/guide/static-deploy.html
7. **Supabase docs:** https://supabase.com/docs

### Common Resources

- **Vite + GitHub Pages:** https://vitejs.dev/guide/static-deploy.html#github-pages
- **SPA fallback for GitHub Pages:** https://github.com/rafgraph/spa-github-pages
- **Supabase Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security

---

**Last Updated:** 2025-11-15
**Tech Stack:** React + Vite + Supabase + GitHub Pages
**Build Status:** ⏳ Configuration Required (follow steps above)
**Deployment Method:** GitHub Actions (Automatic once configured)
