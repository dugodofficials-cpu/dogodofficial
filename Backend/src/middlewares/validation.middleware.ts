import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import { HttpException } from '@exceptions/HttpException';
const validationMiddleware = (
  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, res, next) => {
    validate(plainToInstance(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const messages = [];
        const extractErrorMessages = (error: ValidationError): void => {
          if (error.constraints) {
            messages.push(...Object.values(error.constraints));
          }
          if (error.children && error.children.length > 0) {
            error.children.forEach(extractErrorMessages);
          }
        };
        errors.forEach(extractErrorMessages);
        const message = messages.join(', ');
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};
export default validationMiddleware;