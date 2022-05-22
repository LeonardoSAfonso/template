import morgan from 'morgan';
import { Request } from 'express';

export default function morganConfig(): void {
  morgan.token(
    'req-body',
    (req: Request) => `Body: ${JSON.stringify(req.body)}`,
  );

  morgan.token(
    'req-headers',
    (req: Request) => `Headers: ${JSON.stringify(req.headers)}`,
  );

  morgan.format('log-format', `:req-body`);
}
