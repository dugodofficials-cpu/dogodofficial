import { DataStoredInToken, TokenData } from '@backend/auth/auth.interface';
import { User, UserDocument } from '@backend/users/users.interface';
import userModel from '@backend/users/users.model';
import { SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL } from '@backend/config';
import { HttpException } from '@backend/exceptions/HttpException';
import { isEmpty } from '@backend/utils/util';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SignUpDto, SignUpGoogleDto } from './auth.dto';
import { Types } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '@backend/utils/logger';
import EmailVerificationService from './emailVerification.service';
import PasswordResetService from './passwordReset.service';
import SessionService from './session.service';
import EmailService from '@backend/email/email.service';
class AuthService {
  public users = userModel;
  private googleClient: OAuth2Client;
  private emailVerificationService: EmailVerificationService;
  private passwordResetService: PasswordResetService;
  private sessionService: SessionService;
  private emailService: EmailService;
  constructor() {
    this.users = userModel;
    this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    this.emailVerificationService = new EmailVerificationService();
    this.passwordResetService = new PasswordResetService();
    this.sessionService = new SessionService();
    this.emailService = new EmailService();
  }
  public async signup(userData: SignUpDto): Promise<{ message: string }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
    const findUser = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);
    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.users.create({
      ...userData,
      password: hashedPassword,
      isEmailVerified: false,
      status: 'pending'
    });
    try {
      await this.emailVerificationService.sendVerificationEmail(
        createUserData._id.toString(),
        createUserData.email,
        createUserData.firstName
      );
    } catch (error) {
      logger.error(`Failed to send verification email during signup: ${error.message}`);
    }
    return {
      message: 'Account created successfully. Please check your email to verify your account.'
    };
  }
  public async login(userData: SignUpDto, ipAddress?: string, userAgent?: string): Promise<{ token: string; findUser: UserDocument; cookie: string }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
    const findUser = await this.users.findOne({ email: userData.email.toLowerCase() }).populate('userRoles').select('+password')
    if (!findUser || !findUser.password) throw new HttpException(401, `Invalid email or password`);
    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(401, 'Invalid email or password');
    if (!findUser.isEmailVerified) {
      throw new HttpException(403, 'Please verify your email address before logging in. Check your inbox for a verification email.');
    }
    if (findUser.status !== 'active') {
      throw new HttpException(403, 'Your account is not active. Please contact support for assistance.');
    }
    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);
    try {
      await this.sessionService.createSession(
        findUser.id,
        tokenData.token,
        ipAddress,
        userAgent,
        tokenData.expiresIn,
      );
    } catch (error) {
      logger.error(`Failed to create session for user ${findUser._id}: ${error.message}`);
    }
    return { token: tokenData.token, findUser, cookie };
  }
  public async logout(userData: User, token?: string): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
    const findUser = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);
    if (token) {
      try {
        await this.sessionService.revokeSession(token);
        logger.info(`Session revoked for user ${findUser._id}`);
      } catch (error) {
        logger.error(`Failed to revoke session for user ${findUser._id}: ${error.message}`);
      }
    }
    return findUser;
  }
  public async findUserById(userId: Types.ObjectId): Promise<User> {
    const findUser = await this.users.findById(userId);
    if (!findUser) throw new HttpException(404, 'User not found');
    return findUser;
  }
  public async verifyEmail(token: string): Promise<{ success: boolean; message: string; token?: string; cookie?: string; user?: User }> {
    const result = await this.emailVerificationService.verifyEmail(token);
    if (result.success && result.user) {
      await this.users.findByIdAndUpdate(result.user._id, {
        status: 'active'
      });
      logger.info(`User ${result.user._id} activated after email verification`);
      const tokenData = this.createToken(result.user);
      const cookie = this.createCookie(tokenData);
      try {
        await this.sessionService.createSession(
          result.user.id,
          tokenData.token,
          undefined,
          undefined,
          tokenData.expiresIn,
        );
      } catch (error) {
        logger.error(`Failed to create session for user ${result.user._id}: ${error.message}`);
      }
      return {
        success: true,
        message: 'Email verified successfully! You are now logged in.',
        token: tokenData.token,
        cookie,
        user: {
          ...result.user.toObject(),
          status: 'active'
        }
      };
    }
    return result;
  }
  public async resendVerificationEmail(email: string): Promise<{ message: string }> {
    await this.emailVerificationService.resendVerificationEmail(email);
    return { message: 'Verification email sent successfully' };
  }
  public async checkEmailVerificationStatus(email: string): Promise<{ isVerified: boolean; status: string; message: string }> {
    if (isEmpty(email)) throw new HttpException(400, 'Email is required');
    const user = await this.users.findOne({ email }).select('isEmailVerified status');
    if (!user) {
      throw new HttpException(404, 'User not found');
    }
    return {
      isVerified: user.isEmailVerified || false,
      status: user.status || 'pending',
      message: user.isEmailVerified
        ? 'Email is verified and account is active'
        : 'Email verification required'
    };
  }
  public async forgotPassword(email: string): Promise<{ message: string }> {
    if (isEmpty(email)) throw new HttpException(400, 'Email is required');
    await this.passwordResetService.sendPasswordResetEmail(email);
    return { message: 'If an account with your email exists, a password reset link has been sent.' };
  }
  public async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (isEmpty(token) || isEmpty(newPassword)) throw new HttpException(400, 'Token and new password are required');
    const result = await this.passwordResetService.resetPassword(token, newPassword);
    return { message: result.message };
  }

  public async verifyResetToken(token: string): Promise<{ valid: boolean; message: string }> {
    if (isEmpty(token)) throw new HttpException(400, 'Token is required');
    return await this.passwordResetService.verifyResetToken(token);
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id.toString() };
    const secretKey = (SECRET_KEY)!;
    const expiresIn: number = 180 * 24 * 60 * 60;
    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    const isProd = process.env.NODE_ENV === 'production';
    const secureFlag = isProd ? ' Secure;' : '';
    const sameSite = isProd ? 'None' : 'Lax';
    const domainFlag = isProd ? ' Domain=.dugodofficial.com;' : '';
    return `Authorization=${tokenData.token}; HttpOnly; Path=/; SameSite=${sameSite};${secureFlag}${domainFlag} Max-Age=${tokenData.expiresIn};`;
  }

  public async signupGoogle(userData: SignUpGoogleDto): Promise<{ user: User, token: string, cookie: string; message: string }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: userData.token,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) throw new HttpException(400, 'Invalid Google token');
      let user = await this.users.findOne({ email: payload.email });
      if (user) {
        if (!user.picture && payload.picture) {
          user.picture = payload.picture;
          await user.save();
        }
        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);
        try {
          await this.sessionService.createSession(
            user.id,
            tokenData.token,
            undefined,
            undefined,
            tokenData.expiresIn,
          );
        } catch (error) {
          logger.error(`Failed to create session for user ${user._id}: ${error.message}`);
        }
        return { user, token: tokenData.token, cookie, message: 'Login successful' };
      }
      // Google-created accounts have no password of their own, but the schema
      // stores one field for both auth methods — write a bcrypt hash of the
      // (unguessable, per-user) Google subject claim rather than the raw
      // value, so this field is a real hash like every other account's,
      // never a plaintext secret-shaped string sitting in the DB.
      const hashedGoogleSecret = await hash(payload.sub, 10);
      const createUserData: User = await this.users.create({
        email: payload.email,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        picture: payload.picture || '',
        password: hashedGoogleSecret,
        phone: '',
        status: 'active',
        isEmailVerified: true,
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
      });
      const tokenData = this.createToken(createUserData);
      const cookie = this.createCookie(tokenData);
      try {
        await this.sessionService.createSession(
          createUserData._id,
          tokenData.token,
          undefined,
          undefined,
          tokenData.expiresIn,
        );
      } catch (error) {
        logger.error(`Failed to create session for user ${createUserData._id}: ${error.message}`);
      }
      try {
        await this.emailService.sendTemplateEmail({
          to: [createUserData.email],
          templateName: 'welcome',
          variables: {
            firstName: createUserData.firstName || 'there',
            siteUrl: FRONTEND_URL || 'http://localhost:3000',
          },
        });
      } catch (error) {
        logger.error(`Failed to send welcome email to ${createUserData.email}: ${error.message}`);
      }
      return {
        user: createUserData,
        token: tokenData.token,
        cookie,
        message: 'Account created successfully.'
      };
    } catch (error) {
      logger.error(error);
      throw new HttpException(401, 'Invalid Google token');
    }
  }
}
export default AuthService;