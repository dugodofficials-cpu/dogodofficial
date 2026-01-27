import { Document, Types } from 'mongoose';
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}
export interface Session {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  status: SessionStatus;
  lastActivityAt: Date;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
export type SessionDocument = Document & Session;