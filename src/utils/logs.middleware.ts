import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    response.on('finish', () => {
      const { method, originalUrl, body, user } = request;
      const byUser = user ? ` BY user_id ${user['user_id']}` : '';

      const { statusCode, statusMessage } = response;

      const message = `${method} ${originalUrl} ${
        statusCode >= 400 && ['POST', 'PUT'].includes(method)
          ? JSON.stringify(body)
          : ''
      } ${statusCode} ${statusMessage}${byUser}`;

      if (statusCode >= 500) {
        return this.logger.error(message);
      }

      if (statusCode >= 400) {
        return this.logger.warn(message);
      }

      return this.logger.log(message);
    });

    next();
  }
}

export default LogsMiddleware;
