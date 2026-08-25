import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;
export const { MONGODB_URI, DB_HOST, DB_PORT, DB_DATABASE, DB_URI } = process.env;
export const { PAYSTACK_SECRET_KEY, APP_URL } = process.env;
// PAYSTACK_PUBLIC_KEY is only ever needed client-side to init Paystack's inline
// JS, so it must be a NEXT_PUBLIC_ var to reach the browser bundle. Accept
// either name so an env setup using the un-prefixed one (as some historical
// docs/.env.example did) doesn't silently ship a blank Paystack key.
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY;
// The public site URL used to build links in emails (password reset, email
// verification). No dedicated FRONTEND_URL var is provisioned anywhere in
// Vercel — NEXT_PUBLIC_APP_URL is the one that's actually set in production.
export const FRONTEND_URL = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL;
export const { STORAGE_API_URL, STORAGE_BUCKET_NAME, STORAGE_TOKEN_ID, STORAGE_TOKEN_SECRET } = process.env;
export const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
export const { ZEPTO_API_TOKEN, ZEPTO_DOMAIN } = process.env;
export const dbConfig = {
  url: process.env.MONGODB_URL,
  database: process.env.MONGODB_DATABASE,
};
export const shippingConfig = {
  dhl: {
    apiEndpoint: process.env.DHL_API_ENDPOINT || '',
    apiKey: process.env.DHL_API_KEY,
    accountNumber: process.env.DHL_ACCOUNT_NUMBER,
  },
};
export const appConfig = {
  credentials: CREDENTIALS,
  env: NODE_ENV,
  port: PORT,
  secretKey: SECRET_KEY,
  logFormat: LOG_FORMAT,
  logDir: LOG_DIR,
  origin: ORIGIN,
  db: dbConfig,
  shipping: shippingConfig,
  google: {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  },
  zepto: {
    apiToken: ZEPTO_API_TOKEN,
    domain: ZEPTO_DOMAIN,
    url: 'api.zeptomail.com/'
  },
};