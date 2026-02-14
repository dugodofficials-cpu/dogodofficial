export declare const CREDENTIALS: boolean;
export declare const NODE_ENV: string, PORT: string, SECRET_KEY: string, LOG_FORMAT: string, LOG_DIR: string, ORIGIN: string;
export declare const MONGODB_URI: string, DB_HOST: string, DB_PORT: string, DB_DATABASE: string, DB_URI: string;
export declare const PAYSTACK_SECRET_KEY: string, PAYSTACK_PUBLIC_KEY: string, APP_URL: string;
export declare const AWS_ACCESS_KEY_ID: string, AWS_SECRET_ACCESS_KEY: string, AWS_REGION: string, AWS_S3_BUCKET: string;
export declare const GOOGLE_CLIENT_ID: string, GOOGLE_CLIENT_SECRET: string;
export declare const ZEPTO_API_TOKEN: string, ZEPTO_DOMAIN: string;
export declare const dbConfig: {
    url: string;
    database: string;
};
export declare const shippingConfig: {
    dhl: {
        apiEndpoint: string;
        apiKey: string;
        accountNumber: string;
    };
};
export declare const appConfig: {
    credentials: boolean;
    env: string;
    port: string;
    secretKey: string;
    logFormat: string;
    logDir: string;
    origin: string;
    db: {
        url: string;
        database: string;
    };
    shipping: {
        dhl: {
            apiEndpoint: string;
            apiKey: string;
            accountNumber: string;
        };
    };
    google: {
        clientId: string;
        clientSecret: string;
    };
    zepto: {
        apiToken: string;
        domain: string;
        url: string;
    };
};
