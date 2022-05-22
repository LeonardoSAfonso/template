import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { secret } from '../../config/Auth';
import AppError from '../errors/AppError';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}
export default function Auth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError('ERRO: Token de acesso não informado', 401);
  }
  const [, token] = authHeader.split(' ');
  try {
    const decoded = verify(token, secret);
    const { sub } = decoded as TokenPayload;
    req.user = {
      id: Number(sub.split('/')[0]),
      access_level: Number(sub.split('/')[1]),
    };
    next();
  } catch (err) {
    throw new AppError('ERRO: Token de acesso inválido', 401);
  }
}
