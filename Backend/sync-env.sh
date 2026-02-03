#!/bin/bash

echo "🚀 Syncing environment variables to EC2..."

# Create a temporary env file with all required variables
cat > temp-env.txt << 'EOF'
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://dugodofficial:DuGod2024@cluster0.mongodb.net/dugod?retryWrites=true&w=majority
AWS_ACCESS_KEY_ID=AKIA3NI7PTV3WCEPBZOQ
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=eu-north-1
AWS_S3_BUCKET=dugod-media
AWS_S3_PUBLIC_BUCKET=dugod-public
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
GOOGLE_CLIENT_ID=placeholder-google-client-id
ZEPTO_API_TOKEN=placeholder-zepto-token
ZEPTO_DOMAIN=placeholder-domain.com
EOF

echo "✅ Environment file created"
echo "📋 Copy these variables to your EC2 instance .env file"
echo ""
echo "On EC2, run:"
echo "cat > .env << 'EOF'"
cat temp-env.txt
echo "EOF"
echo ""
echo "Then restart PM2:"
echo "pm2 restart dugod-backend-full --update-env"

rm temp-env.txt
