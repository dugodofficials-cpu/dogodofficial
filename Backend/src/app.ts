import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set, disconnect, connection } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { defaultLimiter } from '@middlewares/rateLimit.middleware';
import { strictSecurity } from '@middlewares/security.middleware';
import { logger, stream } from '@utils/logger';
import setupOrderTemplates from './modules/orders/setup-order-templates';
class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }
  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }
  public async closeDatabaseConnection(): Promise<void> {
    try {
      await disconnect();
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error closing database connection:', error);
    }
  }
  public getServer() {
    return this.app;
  }
  private async connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }
    set('strictQuery', false);
    await connect(dbConnection.url);
    await connection.db.admin().command({ ping: 1 });
    logger.info('Pinged your deployment. You successfully connected to MongoDB!');
  }
  private initializeMiddlewares() {
    this.app.set('trust proxy', 1);
    this.app.use(strictSecurity);
    this.app.use(morgan(LOG_FORMAT, { stream }));
    const allowedOrigins = ORIGIN ? ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean) : [];
    const corsOrigin = this.env === 'development'
      ? true
      : (allowedOrigins.length > 0 ? allowedOrigins : true);
    const corsOptions: cors.CorsOptions = {
      origin: corsOrigin,
      credentials: CREDENTIALS,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400,
    };
    this.app.use(cors(corsOptions));
    this.app.options('*', cors(corsOptions));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use((req, res, next) => {
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        return next();
      }
      next();
    });
    this.app.use(express.json({ limit: '2mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '2mb' }));
    this.app.use(cookieParser());
    this.app.use((req, res, next) => {
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        console.error('[APP DEBUG] Skipping rate limiter for multipart request', {
          method: req.method,
          path: req.path,
          contentLength: req.headers['content-length']
        });
        return next();
      }
      defaultLimiter(req, res, next);
    });
  }
  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }
  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Dugod official API docs',
        },
      },
      apis: ['swagger.yaml'],
    };
    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }
  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}
export default App;