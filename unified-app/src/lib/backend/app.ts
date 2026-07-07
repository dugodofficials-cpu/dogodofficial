import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set, connection } from 'mongoose';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@backend/config';
import { dbConnection } from '@backend/databases';
import { Routes } from '@backend/interfaces/routes.interface';
import errorMiddleware from '@backend/middlewares/error.middleware';
import { defaultLimiter } from '@backend/middlewares/rateLimit.middleware';
import { strictSecurity } from '@backend/middlewares/security.middleware';
import { signPublicUrls } from '@backend/middlewares/signPublicUrls.middleware';
import { logger, stream } from '@backend/utils/logger';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  private dbConnected = false;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    if (this.dbConnected || connection.readyState === 1) return;
    try {
      if (this.env !== 'production') {
        set('debug', true);
      }
      set('strictQuery', false);
      await connect(dbConnection.url);
      await connection.db.admin().command({ ping: 1 });
      this.dbConnected = true;
      logger.info('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
    }
  }

  private initializeMiddlewares() {
    this.app.set('trust proxy', 1);
    this.app.use(strictSecurity);
    this.app.use(morgan(LOG_FORMAT || 'dev', { stream }));
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
    this.app.use(express.json({ limit: '2mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '2mb' }));
    this.app.use(cookieParser());
    this.app.use(signPublicUrls);
    this.app.use((req, res, next) => {
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
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

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
