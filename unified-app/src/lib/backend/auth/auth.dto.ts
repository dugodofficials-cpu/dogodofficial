import { IsEmail, IsString } from 'class-validator';
export class SignUpDto {
  @IsEmail()
  public email: string;
  @IsString()
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
  public password: string;
}