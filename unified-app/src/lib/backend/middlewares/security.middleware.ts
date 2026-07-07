import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@backend/exceptions/HttpException';
import { logger } from '@backend/utils/logger';
interface SecurityConfig {
  blockSuspiciousQueries: boolean;
  blockPathTraversal: boolean;
  blockAirflowExploits: boolean;
  logSuspiciousActivity: boolean;
  strictMode: boolean;
}
const defaultConfig: SecurityConfig = {
  blockSuspiciousQueries: true,
  blockPathTraversal: true,
  blockAirflowExploits: true,
  logSuspiciousActivity: true,
  strictMode: true,
};
export const securityMiddleware = (config: Partial<SecurityConfig> = {}) => {
  const settings = { ...defaultConfig, ...config };
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { method, url, query, body, headers } = req;
      const userAgent = headers['user-agent'] || '';
      const fullUrl = `${method} ${url}`;
      const suspiciousPatterns = [
        /\.\.[\/\\]/,
        /\.\.\\\\/,
        /\.\.%2f/i,
        /\.\.%5c/i,
        /\.\.\u002f/,
        /pearcmd/i,
        /config-create/i,
        /safedog/i,
        /php:\/\//i,
        /data:\/\//i,
        /expect:\/\//i,
        /\/api\/experimental\/dags/i,
        /\/api\/v1\/dags/i,
        /dag_runs/i,
        /trigger_dag/i,
        /union\s+select/i,
        /information_schema/i,
        /load_file\(/i,
        /into\s+outfile/i,
        /;(\s*)cat(\s+)/i,
        /;(\s*)wget(\s+)/i,
        /;(\s*)curl(\s+)/i,
        /;(\s*)nc(\s+)/i,
        /;(\s*)netcat(\s+)/i,
        /;(\s*)bash(\s+)/i,
        /;(\s*)sh(\s+)/i,
        /<script[^>]*>/i,
        /javascript:/i,
        /vbscript:/i,
        /onload\s*=/i,
        /onerror\s*=/i,
        /\/etc\/passwd/i,
        /\/etc\/hosts/i,
        /\/proc\//i,
        /\/usr\/local\/lib/i,
        /\/var\/log/i,
        /\.log$/i,
        /sqlmap/i,
        /nmap/i,
        /masscan/i,
        /nuclei/i,
        /burpsuite/i,
      ];
      if (settings.blockSuspiciousQueries || settings.blockPathTraversal || settings.blockAirflowExploits) {
        const urlToCheck = url.toLowerCase();
        const queryString = Object.keys(query).map(key => `${key}=${query[key]}`).join('&').toLowerCase();
        const fullCheck = `${urlToCheck} ${queryString}`;
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(fullCheck)) {
            if (settings.logSuspiciousActivity) {
              logger.warn(`SECURITY ALERT: Blocked suspicious request from ${req.ip}`, {
                method,
                url,
                query,
                userAgent,
                pattern: pattern.toString(),
                clientIp: req.ip,
                forwardedFor: req.get('X-Forwarded-For'),
              });
            }
            if (settings.strictMode) {
              throw new HttpException(404, 'Not Found');
            } else {
              throw new HttpException(400, 'Bad Request');
            }
          }
        }
      }
      if (settings.blockAirflowExploits) {
        if (url.includes('/api/experimental/') || url.includes('/dag_runs') || url.includes('trigger_dag')) {
          if (settings.logSuspiciousActivity) {
            logger.warn(`SECURITY ALERT: Blocked Airflow exploitation attempt from ${req.ip}`, {
              method,
              url,
              userAgent,
              clientIp: req.ip,
              forwardedFor: req.get('X-Forwarded-For'),
            });
          }
          throw new HttpException(404, 'Not Found');
        }
      }
      if (settings.blockSuspiciousQueries) {
        const suspiciousParams = ['lang', 'file', 'page', 'include', 'dir', 'action', 'cmd', 'exec', 'system'];
        for (const param of suspiciousParams) {
          if (query[param]) {
            const value = String(query[param]).toLowerCase();
            if (value.includes('../') || value.includes('..\\') || value.includes('/etc/') || value.includes('usr/local/lib')) {
              if (settings.logSuspiciousActivity) {
                logger.warn(`SECURITY ALERT: Blocked suspicious parameter from ${req.ip}`, {
                  method,
                  url,
                  suspiciousParam: param,
                  value: query[param],
                  userAgent,
                  clientIp: req.ip,
                  forwardedFor: req.get('X-Forwarded-For'),
                });
              }
              throw new HttpException(404, 'Not Found');
            }
          }
        }
      }
      if (url.includes('\0') || JSON.stringify(query).includes('\0')) {
        if (settings.logSuspiciousActivity) {
          logger.warn(`SECURITY ALERT: Blocked null byte injection from ${req.ip}`, {
            method,
            url,
            query,
            userAgent,
            clientIp: req.ip,
          });
        }
        throw new HttpException(400, 'Bad Request');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
export const strictSecurity = securityMiddleware({
  blockSuspiciousQueries: true,
  blockPathTraversal: true,
  blockAirflowExploits: true,
  logSuspiciousActivity: true,
  strictMode: true,
});
export const basicSecurity = securityMiddleware({
  blockSuspiciousQueries: true,
  blockPathTraversal: true,
  blockAirflowExploits: true,
  logSuspiciousActivity: true,
  strictMode: false,
});
export default securityMiddleware;