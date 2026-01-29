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
import { Session, SessionDocument } from './session.interface';
import { Types } from 'mongoose';
declare class SessionService {
    sessions: import("mongoose").Model<Session & import("mongoose").Document<any, any, any>, {}, {}, {}, any>;
    createSession(userId: Types.ObjectId, token: string, ipAddress?: string, userAgent?: string, expiresIn?: number): Promise<SessionDocument>;
    findSessionByToken(token: string): Promise<SessionDocument | null>;
    findUserSessions(userId: Types.ObjectId, includeExpired?: boolean): Promise<SessionDocument[]>;
    updateLastActivity(token: string): Promise<void>;
    revokeSession(token: string): Promise<void>;
    revokeAllUserSessions(userId: Types.ObjectId, excludeToken?: string): Promise<void>;
    revokeSessionById(sessionId: string, userId: Types.ObjectId): Promise<void>;
    cleanupExpiredSessions(): Promise<number>;
    getUserSessionCount(userId: Types.ObjectId): Promise<number>;
}
export default SessionService;
