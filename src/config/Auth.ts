import 'dotenv/config';

const secret = process.env.AUTH_SECRET || 'default';
const expiresIn = '1d';

export { secret, expiresIn };
