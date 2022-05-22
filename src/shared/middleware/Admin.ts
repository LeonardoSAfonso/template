import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError';

export default async function Admin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.user.access_level > 1) {
    throw new AppError('ERRO: Acesso não permitido.', 403);
  }
  next();
}
