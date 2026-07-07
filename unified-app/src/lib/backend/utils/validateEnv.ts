import { cleanEnv, port, str } from 'envalid';
const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port({ default: 3000 }),
    PAYSTACK_SECRET_KEY: str({ default: '' }),
    GOOGLE_CLIENT_ID: str({ default: '' }),
    STORAGE_API_URL: str({ default: '' }),
    STORAGE_BUCKET_NAME: str({ default: '' }),
    STORAGE_TOKEN_ID: str({ default: '' }),
    STORAGE_TOKEN_SECRET: str({ default: '' }),
    ZEPTO_API_TOKEN: str({ default: '' }),
    ZEPTO_DOMAIN: str({ default: '' }),
  });
};
export default validateEnv;