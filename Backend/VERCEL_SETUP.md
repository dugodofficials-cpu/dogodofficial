# Vercel Serverless Deployment Setup

## Quick Start

Your backend API has been successfully configured for serverless deployment on Vercel. Follow these steps to deploy:

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Create Environment Variables

Create a `.env.production` file (don't commit this):
```bash
NODE_ENV=production
CRON_SECRET=your-random-secret-token-12345
MONGODB_URI=your-mongodb-atlas-connection-string
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=eu-north-1
AWS_S3_BUCKET=dugodofficial-media
AWS_S3_PUBLIC_BUCKET=dugodofficial-public
PAYSTACK_SECRET_KEY=your-paystack-live-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
ZEPTO_API_TOKEN=your-zepto-token
ORIGIN=https://dugodofficial.com,https://admin.dugodofficial.com,https://www.dugodofficial.com
CREDENTIALS=true
```

### 3. Deploy to Vercel

#### Using Vercel CLI:
```bash
npm install -g vercel
vercel --prod
```

#### Using GitHub:
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard Settings → Environment Variables
4. Deploy automatically on push to main

### 4. Set Up Job Processing (Choose one)

#### Option A: GitHub Actions (Recommended - Free)
Create `.github/workflows/process-jobs.yml`:
```yaml
name: Process Background Jobs

on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  process-jobs:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger job processing
        run: |
          curl -X POST https://api.dugodofficial.com/api/cron/process-jobs \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

Then add CRON_SECRET to GitHub repository secrets.

#### Option B: EasyCron (Free)
1. Go to https://www.easycron.com/
2. Click "Cron Jobs" → "New Cron Job"
3. Fill in:
   - **URL**: `https://api.dugodofficial.com/api/cron/process-jobs`
   - **Method**: POST
   - **HTTP Headers**: Add header "Authorization: Bearer YOUR_CRON_SECRET"
   - **Cron Expression**: `*/5 * * * *` (every 5 minutes)
4. Save

#### Option C: Trigger.dev (Best for complex workflows)
```bash
npm install @trigger.dev/sdk
# Follow Trigger.dev documentation for setup
```

### 5. Verify Deployment

Test the API:
```bash
# Test main endpoint
curl https://api.dugodofficial.com/

# Test job processing
curl -X POST https://api.dugodofficial.com/api/cron/process-jobs \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Architecture Overview

### Before (Traditional Server)
```
┌─────────────────────┐
│   Express Server    │
│  (PM2, Port 80)     │
│                     │
│ - Job Processor     │
│ - Polling (5min)    │
│ - Persistent        │
└─────────────────────┘
```

### After (Serverless on Vercel)
```
┌──────────────────────────────────────────────┐
│         Vercel Serverless Functions          │
├──────────────────────────────────────────────┤
│                                              │
│  /api/index.ts → Express App (10s timeout)   │
│  - All REST endpoints                        │
│  - Database queries                          │
│  - File uploads (to S3)                      │
│                                              │
│  /api/cron/process-jobs.ts (webhook)         │
│  - Triggered every 5 minutes                 │
│  - Processes background jobs                 │
│  - Sends emails                              │
│                                              │
└──────────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────┐
│  External Services (Unchanged)               │
│  - MongoDB Atlas                             │
│  - AWS S3                                    │
│  - Paystack                                  │
│  - Resend/Zepto (Email)                      │
│  - Google OAuth                              │
└──────────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `api/index.ts` | Main serverless handler wrapping Express app |
| `api/cron/process-jobs.ts` | Cron job endpoint for background tasks |
| `vercel.json` | Vercel deployment configuration |
| `SERVERLESS_MIGRATION.md` | Detailed migration documentation |
| `package.json` | Updated with @vercel/node, removed PM2 |
| `src/server.ts` | Updated (job processor removed) |
| `src/middlewares/upload.middleware.ts` | Updated (memory storage support) |

## Important Notes

### Limitations (Vercel Free Plan)
- ⏱️ **10 second function timeout** - Long operations must be async jobs
- 💾 **512MB memory limit** - Large file uploads must stream to S3 (already configured)
- 🔄 **12 concurrent functions** - Should be sufficient for most workloads
- 📦 **45 minutes build time/month** - More than enough for typical changes

### What Works ✅
- All API endpoints (keep under 10 seconds)
- File uploads (streams to S3, uses memory storage)
- Database operations
- Authentication & authorization
- Payment processing
- Email sending
- Job queuing via MongoDB

### What Doesn't Work ❌
- WebSockets (use HTTP polling instead)
- Persistent background services (use cron jobs instead)
- Large batch operations >10 seconds (split into jobs)
- File storage on disk (must use S3)

## Monitoring

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Function Logs**: Real-time logs visible in Vercel dashboard
- **MongoDB**: Monitor connection usage in MongoDB Atlas dashboard
- **Errors**: Set up email alerts in Vercel dashboard

## Cost

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | $0 |
| MongoDB Atlas | M0 (512MB) | $0 |
| AWS S3 | Free tier + usage | $0-10 |
| GitHub Actions | 2000 min/month | $0 |
| EasyCron | 10 jobs free | $0 |
| **Total** | - | **$0-10/month** |

## Troubleshooting

### "Function timeout (Lambda 10s)"
- Your endpoint took >10 seconds
- Move long operations to job queue
- Use `/api/cron/process-jobs` for background processing

### "Cannot find module '@/...'"
- Rebuild: `npm run build`
- Verify tsconfig.json includes api folder
- Check import paths

### "MongoDB connection timeout"
- Add Vercel IP range to MongoDB Atlas whitelist
- Or use IP allow-all in development

### "S3 upload fails"
- Verify AWS credentials
- Check S3 bucket names match env variables
- Ensure bucket policies allow PutObject

## Local Development

```bash
# Start dev server (no job processor)
npm run dev

# Run build locally
npm run build

# Test with Vercel CLI
vercel dev

# Test production build
NODE_ENV=production npm run start
```

## Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Set up cron job service
3. ✅ Deploy and test endpoints
4. ✅ Monitor logs for issues
5. ✅ Update frontend API URLs if needed
6. ⚠️ **IMPORTANT**: Do NOT commit sensitive environment variables or .env files

## Support Resources

- [Vercel Docs - Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Node.js Runtime](https://vercel.com/docs/runtimes/nodejs)
- [Express + Vercel](https://vercel.com/guides/using-express-with-vercel)
- [MongoDB Atlas + Vercel](https://www.mongodb.com/docs/atlas/configure-ip-access-list/)
