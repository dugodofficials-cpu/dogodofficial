/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { TokenData } from '../../modules/auth/auth.interface';
import { User, UserDocument } from '../../modules/users/users.interface';
import { SignUpDto, SignUpGoogleDto } from './auth.dto';
import { Types } from 'mongoose';
declare class AuthService {
    users: import("mongoose").Model<User & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    private googleClient;
    private emailVerificationService;
    private passwordResetService;
    private sessionService;
    constructor();
    signup(userData: SignUpDto): Promise<{
        message: string;
    }>;
    login(userData: SignUpDto, ipAddress?: string, userAgent?: string): Promise<{
        token: string;
        findUser: UserDocument;
        cookie: string;
    }>;
    logout(userData: User, token?: string): Promise<User>;
    findUserById(userId: Types.ObjectId): Promise<User>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
        token?: string;
        cookie?: string;
        user?: User;
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
    checkEmailVerificationStatus(email: string): Promise<{
        isVerified: boolean;
        status: string;
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    verifyResetToken(token: string): Promise<{
        valid: boolean;
        message: string;
    }>;
    createToken(user: User): TokenData;
    createCookie(tokenData: TokenData): string;
    signupGoogle(userData: SignUpGoogleDto): Promise<{
        user: User;
        token: string;
        cookie: string;
        message: string;
    }>;
}
export default AuthService;
