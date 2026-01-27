import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { Session, SessionStatus, SessionDocument } from './session.interface';
import sessionModel from './session.model';
import { Types } from 'mongoose';
class SessionService {
  public sessions = sessionModel;
  public async createSession(
    userId: Types.ObjectId,
    token: string,
    ipAddress?: string,
    userAgent?: string,
    expiresIn: number = 180 * 24 * 60 * 60,
  ): Promise<SessionDocument> {
    if (isEmpty(userId) || isEmpty(token)) {
      throw new HttpException(400, 'UserId and token are required');
    }
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const session = await this.sessions.create({
      user: userId,
      token,
      ipAddress,
      userAgent,
      status: SessionStatus.ACTIVE,
      lastActivityAt: new Date(),
      expiresAt,
    });
    return session;
  }
  public async findSessionByToken(token: string): Promise<SessionDocument | null> {
    if (isEmpty(token)) {
      return null;
    }
    return await this.sessions.findOne({
      token,
      status: SessionStatus.ACTIVE,
      expiresAt: { $gt: new Date() },
    });
  }
  public async findUserSessions(userId: Types.ObjectId, includeExpired: boolean = false): Promise<SessionDocument[]> {
    if (isEmpty(userId)) {
      throw new HttpException(400, 'UserId is required');
    }
    const query: any = { user: userId };
    if (!includeExpired) {
      query.status = SessionStatus.ACTIVE;
      query.expiresAt = { $gt: new Date() };
    }
    return await this.sessions.find(query).sort({ lastActivityAt: -1 });
  }
  public async updateLastActivity(token: string): Promise<void> {
    if (isEmpty(token)) {
      return;
    }
    await this.sessions.findOneAndUpdate(
      { token, status: SessionStatus.ACTIVE },
      { lastActivityAt: new Date() },
    );
  }
  public async revokeSession(token: string): Promise<void> {
    if (isEmpty(token)) {
      throw new HttpException(400, 'Token is required');
    }
    await this.sessions.findOneAndUpdate(
      { token },
      { status: SessionStatus.REVOKED },
    );
  }
  public async revokeAllUserSessions(userId: Types.ObjectId, excludeToken?: string): Promise<void> {
    if (isEmpty(userId)) {
      throw new HttpException(400, 'UserId is required');
    }
    const query: any = {
      user: userId,
      status: SessionStatus.ACTIVE,
    };
    if (excludeToken) {
      query.token = { $ne: excludeToken };
    }
    await this.sessions.updateMany(query, { status: SessionStatus.REVOKED });
  }
  public async revokeSessionById(sessionId: string, userId: Types.ObjectId): Promise<void> {
    if (isEmpty(sessionId) || isEmpty(userId)) {
      throw new HttpException(400, 'SessionId and UserId are required');
    }
    const session = await this.sessions.findOne({
      _id: sessionId,
      user: userId,
    });
    if (!session) {
      throw new HttpException(404, 'Session not found');
    }
    await this.sessions.findByIdAndUpdate(sessionId, { status: SessionStatus.REVOKED });
  }
  public async cleanupExpiredSessions(): Promise<number> {
    const result = await this.sessions.updateMany(
      {
        expiresAt: { $lt: new Date() },
        status: SessionStatus.ACTIVE,
      },
      {
        status: SessionStatus.EXPIRED,
      },
    );
    return result.modifiedCount;
  }
  public async getUserSessionCount(userId: Types.ObjectId): Promise<number> {
    return await this.sessions.countDocuments({
      user: userId,
      status: SessionStatus.ACTIVE,
      expiresAt: { $gt: new Date() },
    });
  }
}
export default SessionService;