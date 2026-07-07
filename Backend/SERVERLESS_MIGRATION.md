# Vercel Serverless Migration Guide

This application has been configured to run on Vercel's free plan as a fully serverless application. This document outlines the setup and migration details.

## Architecture Changes

### Before (Traditional Server)
- Single Express server running on PORT 80
- PM2 managing the process
- Local job processor polling every 5 minutes
- Persistent connections and intervals

### After (Serverless on Vercel)
- Express app wrapped in serverless functions
- Each request invokes a new or cached function instance
- Job processing via HTTP endpoints called by external cron service
- Stateless, auto-scaling functions

## Key Files Added/Modified

### New Files
- `api/index.ts` - Main serverless function handler that wraps the Express app
- `api/cron/process-jobs.ts` - Cron endpoint for processing background jobs
- `vercel.json` - Vercel deployment configuration

### Modified Files
- `src/server.ts` - Removed job processor startup
- `src/middlewares/upload.middleware.ts` - Added memory storage support for serverless
- `src/app.ts` - No changes needed (works as-is)
- `package.json` - Removed PM2, added @vercel/node, updated build scripts

## Environment Variables

Add these to your Vercel project settings:

```
NODE_ENV=production
CRON_SECRET=your-secret-token-here
MONGODB_URI=your-mongodb-atlas-uri
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=eu-north-1
AWS_S3_BUCKET=your-bucket
AWS_S3_PUBLIC_BUCKET=your-public-bucket
PAYSTACK_SECRET_KEY=your-paystack-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ZEPTO_API_TOKEN=your-zepto-token
ORIGIN=https://dugodofficial.com,https://admin.dugodofficial.com
CREDENTIALS=true
```

## Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy: `npm run deploy:vercel` or push to main branch

### Connect Job Processing

Since Vercel free plan doesn't have background jobs, use one of these free services:

#### Option 1: GitHub Actions (Recommended for free)
Create `.github/workflows/cron-jobs.yml`:

```yaml
name: Process Jobs
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  process-jobs:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger job processing
        run: |
          curl -X POST https://your-api.vercel.app/api/cron/process-jobs \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### Option 2: EasyCron (Free)
1. Go to https://www.easycron.com/
2. Create new cron job
3. URL: `https://your-api.vercel.app/api/cron/process-jobs`
4. HTTP Headers: `Authorization: Bearer YOUR_CRON_SECRET`
5. Interval: Every 5 minutes

#### Option 3: Trigger.dev (Free tier, recommended long-term)
Set up Trigger.dev for more powerful background job processing with built-in retry logic.

## Limitations & Considerations

### Vercel Free Plan Limits
- **Function timeout**: 10 seconds per request
- **Concurrent functions**: 12
- **Build time**: 45 minutes/month
- **Memory**: 512MB per function
- **No persistent storage**: /tmp is cleaned up after each invocation

### What Works
✅ All API endpoints (under 10 seconds)
✅ Database queries
✅ File uploads (streamed to S3)
✅ Authentication
✅ Email sending
✅ Payment processing

### What Requires Workarounds
❌ Long-running operations (>10 seconds) - Use Trigger.dev or move to Railway
❌ WebSockets - Not supported, use polling instead
❌ Persistent jobs - Use cron + job queue (Jobs collection in MongoDB)
❌ Disk storage - Always stream to S3, never rely on /tmp

## Monitoring

- Check Vercel dashboard for function logs
- Monitor MongoDB connection pool usage
- Watch for timeout errors in API responses
- Set up alerts for 5xx errors in Vercel

## Troubleshooting

### "Database connection timeout"
- Ensure MongoDB Atlas connection string is correct
- Add Vercel IP range to MongoDB Atlas whitelist (or use IP allow-all in dev)
- Check connection pool settings

### "Function timeout after 10 seconds"
- Break long operations into smaller async jobs
- Move to Railway/external service for long-running tasks
- Use Trigger.dev for background processing

### "File upload fails"
- Ensure multer is using memoryStorage on Vercel (already configured)
- Check S3 bucket permissions
- Verify AWS credentials are correct

## Cost Analysis (Free)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | Hobby plan | $0 |
| MongoDB Atlas | M0 (512MB) | $0 |
| AWS S3 | 5GB/month free | $0+ |
| GitHub Actions | 2000 minutes/month | $0 |
| EasyCron | 10 jobs/month free | $0+ |
| **Total** | - | **$0-5** |

## Future Optimizations

1. **Migrate to Railway** ($5-7/month) for persistent job processor
2. **Use Trigger.dev** for advanced job scheduling and retries
3. **CloudFlare Pages** for frontend (already on Vercel, skip this)
4. **Upstash** for Redis caching (free tier available)

## Local Development

Local development remains unchanged:
```bash
npm run dev    # Runs with nodemon on port 3000
```

The job processor will NOT run locally via `npm run dev`. To test job processing locally, you can manually call:
```bash
curl -X POST http://localhost:3000/api/cron/process-jobs \
  -H "Authorization: Bearer test-secret"
```

## Migration Checklist

- [ ] Add @vercel/node to dependencies
- [ ] Create api/index.ts handler
- [ ] Create api/cron/process-jobs.ts
- [ ] Create vercel.json
- [ ] Update package.json scripts
- [ ] Set up environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Set up cron job service (GitHub Actions or EasyCron)
- [ ] Test all API endpoints
- [ ] Test job processing via cron endpoint
- [ ] Monitor logs for issues
- [ ] Update frontend API URLs if needed
