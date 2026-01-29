export declare const rateLimiter: (windowMs?: number, max?: number, customMessage?: {
    status: number;
    error: string;
}) => import("express-rate-limit").RateLimitRequestHandler;
export declare const defaultLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const strictLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const securityLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const rootPathLimiter: import("express-rate-limit").RateLimitRequestHandler;
