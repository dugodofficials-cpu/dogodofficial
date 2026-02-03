import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;
export const { MONGODB_URI, DB_HOST, DB_PORT, DB_DATABASE, DB_URI } = process.env;
export const { PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY, APP_URL } = process.env;
export const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;
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