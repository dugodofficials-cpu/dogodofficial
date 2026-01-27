import { cleanEnv, port, str } from 'envalid';
const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    PAYSTACK_SECRET_KEY: str(),
    GOOGLE_CLIENT_ID: str(),
    AWS_ACCESS_KEY_ID: str(),
    AWS_SECRET_ACCESS_KEY: str(),
    AWS_REGION: str(),
    AWS_S3_BUCKET: str(),
    AWS_S3_PUBLIC_BUCKET: str(),
    ZEPTO_API_TOKEN: str(),
    ZEPTO_DOMAIN: str(),
  });
};
export default validateEnv;