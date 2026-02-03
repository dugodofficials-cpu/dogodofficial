import { DB_HOST, DB_PORT, DB_DATABASE, DB_URI, MONGODB_URI } from '@config';
export const dbConnection = {
  url: MONGODB_URI || DB_URI || `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};