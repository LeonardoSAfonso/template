import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import { CelebrateError } from 'celebrate';

import morgan from 'morgan';
import routes from './routes';

import AppError from './shared/errors/AppError';
import multer from './config/Multer';
import morganConfig from './config/Morgan';

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

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
      // eslint-disable-next-line prettier/prettier
      message: `ERRO: ${err.details.get(err.details.keys().next().value)?.details[0].message
        // eslint-disable-next-line prettier/prettier
        }`,
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;
