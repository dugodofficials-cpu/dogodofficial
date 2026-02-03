# S3 Migration Guide

Follow these steps to migrate your S3 buckets from the old AWS account to the new one.

## 📋 Prerequisites

1. **New AWS Account Credentials**
   - Access Key ID
   - Secret Access Key
   - Region (if different from `eu-north-1`)

2. **Decide on Bucket Names**
   - Keep same names: `dugod-media`, `dugod-public`
   - Or choose new names

## 🚀 Migration Steps

### Step 1: Update Credentials in Scripts

Edit both `create-new-buckets.js` and `migrate-s3.js`:

```javascript
const newCredentials = {
  accessKeyId: 'YOUR_NEW_ACCESS_KEY_ID',     // <-- REPLACE
  secretAccessKey: 'YOUR_NEW_SECRET_KEY',    // <-- REPLACE
  region: 'eu-north-1',                      // <-- UPDATE if different
};
```

If using different bucket names, update these too:

```javascript
const newBuckets = {
  media: 'your-new-media-bucket',    // <-- UPDATE if needed
  public: 'your-new-public-bucket',  // <-- UPDATE if needed
};
```

### Step 2: Create New Buckets

```bash
cd Backend
node create-new-buckets.js
```

This will:
- Create the buckets in your new AWS account
- Set the public bucket to `public-read`
- Configure CORS for the public bucket

### Step 3: Migrate Data

```bash
node migrate-s3.js
```

This will:
- Copy all files from old buckets to new buckets
- Preserve folder structure and metadata
- Show progress and report any failures

### Step 4: Update Environment Variables

The migration script will output the updated environment variables. Update your `Backend/.env`:

```bash
# Replace with your new credentials
AWS_ACCESS_KEY_ID=your_new_access_key_id
AWS_SECRET_ACCESS_KEY=your_new_secret_access_key
AWS_REGION=eu-north-1
AWS_S3_BUCKET=dugod-media          # or your new bucket name
AWS_S3_PUBLIC_BUCKET=dugod-public  # or your new bucket name
```

### Step 5: Test the Migration

1. Restart your backend server
2. Test file uploads in both admin and customer apps
3. Verify existing files are accessible

### Step 6: Clean Up (Optional)

After confirming everything works:

1. **Keep old buckets as backup** for a few weeks
2. **Delete old buckets** when confident:
   ```bash
   aws s3 rb s3://dugod-media --force
   aws s3 rb s3://dugod-public --force
   ```

## 🔍 Verification Commands

### List buckets in new account:
```bash
aws s3 ls
```

### Check bucket contents:
```bash
aws s3 ls s3://dugod-media --recursive
aws s3 ls s3://dugod-public --recursive
```

### Test S3 connection:
```bash
node test-s3.js
```

## ⚠️ Important Notes

1. **Downtime**: There's no downtime - the migration copies files, doesn't move them
2. **Permissions**: Ensure your new AWS account has S3 full access
3. **Region**: Keep the same region to avoid data transfer costs
4. **Backup**: Keep old buckets until you're confident migration worked
5. **Large files**: The script handles large files with multipart uploads

## 🆘 Troubleshooting

### "Access Denied" errors
- Check IAM permissions in new AWS account
- Verify credentials are correct
- Ensure bucket names don't violate naming rules

### "Bucket Already Exists" errors
- This is normal if buckets already exist
- The script will continue with existing buckets

### Migration is slow
- Large files take time to copy
- You can run multiple instances for parallel processing
- Consider using AWS CLI for very large migrations

## 📞 Need Help?

If you encounter issues:
1. Check the error messages carefully
2. Verify AWS credentials and permissions
3. Ensure bucket names are correct
4. Run `test-s3.js` to verify connectivity
