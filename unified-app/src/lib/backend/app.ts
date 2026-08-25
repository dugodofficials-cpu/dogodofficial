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
    if (connection.readyState === 1) return;
    try {
      if (this.env !== 'production') {
        set('debug', true);
      }
      set('strictQuery', false);
      // Indexes already exist in the real cluster from earlier connections.
      // Mongoose's default autoIndex re-verifies/creates every index on every
      // collection on each `connect()` call, which is pure added latency on
      // a serverless cold start (visible as a burst of createIndex calls in
      // logs on every fresh Lambda). Keep it on in dev, where schema changes
      // are frequent and indexes should just appear.
      set('autoIndex', this.env !== 'production');
      await connect(dbConnection.url);
      await connection.db.admin().command({ ping: 1 });
      logger.info('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
    }
  }

  private initializeMiddlewares() {
    this.app.set('trust proxy', 1);
    this.app.use(async (req, res, next) => {
      if (connection.readyState !== 1) {
        await this.connectToDatabase();
      }
      next();
    });
    this.app.use(strictSecurity);
    this.app.use(morgan(LOG_FORMAT || 'dev', { stream }));
    // ORIGIN isn't set in any of .env.example/.env.local/.env.production in this
    // repo, so if it was also never set in Vercel, this used to silently fall
    // back to `true` (reflect-and-allow-any-origin) in production. Fall back to
    // the known real production hosts instead — still overridable via ORIGIN.
    const DEFAULT_PRODUCTION_ORIGINS = [
      'https://dugodofficial.com',
      'https://www.dugodofficial.com',
      'https://admin.dugodofficial.com',
    ];
    const allowedOrigins = ORIGIN
      ? ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
      : DEFAULT_PRODUCTION_ORIGINS;
    const corsOrigin = this.env === 'development' ? true : allowedOrigins;
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
