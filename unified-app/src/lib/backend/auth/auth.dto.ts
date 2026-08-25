import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
export class SignUpDto {
  @IsEmail()
  public email: string;
  // Deliberately loose: this DTO is also reused for /signin (auth.route.ts),
  // where an existing account's real password — created under whatever rules
  // were in force at the time — must still be allowed through to the hash
  // comparison. Strength rules belong on CreateAccountDto (signup) instead.
  @IsString()
  public password: string;
}
export class CreateAccountDto extends SignUpDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
  public password: string;
}
export class SignUpGoogleDto {
  @IsString()
  public token: string;
}
export class ResendVerificationDto {
  @IsEmail()
  public email: string;
}
export class ForgotPasswordDto {
  @IsEmail()
  public email: string;
}
export class ResetPasswordDto {
  @IsString()
  public token: string;
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
  public password: string;
}