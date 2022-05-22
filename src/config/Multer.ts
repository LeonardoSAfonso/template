import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import AppError from '../shared/errors/AppError';

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');

interface FileFilterCallback {
  (error: AppError): void;
  (error: null, acceptFile: boolean): void;
}

export default {
  tmpFolder,
  uploadsFolder: path.resolve(tmpFolder, 'uploads'),

  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash + path.extname(file.originalname)}`;

      return callback(null, fileName);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
  fileFilter(
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ): void {
    const allowedMimes = ['.png', '.jpeg', '.jpg', '.svg', '.img', '.mp4'];

    const fileType = file.originalname.substring(
      file.originalname.indexOf('.'),
    );

    if (allowedMimes.includes(fileType)) {
      callback(null, true);
    } else {
      callback(new AppError('ERRO: Tipo de arquivo inválido.', 415));
    }
  },
};
