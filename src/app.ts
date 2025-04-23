import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { CelebrateError } from 'celebrate';

import morgan from 'morgan';
import routes from './routes';

import AppError from './shared/errors/AppError';
import multer from './config/Multer';
import morganConfig from './config/Logger';

const app = express();

app.use(express.json());
app.use(express.urlencoded());

morganConfig();

app.use(morgan('dev'));
app.use(morgan('log-format'));

app.use('/files', express.static(multer.uploadsFolder));

app.use(cors(), (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  next();
});

app.use(express.static('src/public'));

app.use(routes);

app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof CelebrateError) {
    return res.status(400).json({
      status: err.message,
      message: JSON.stringify(err.details, null, 2),
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;
