import { compare, hash } from 'bcryptjs';
import IHashProvider from '../model/IHashProvider';

export default class BCryptHashProvider implements IHashProvider {
  public async generateHash(payload: string): Promise<string> {
    const hashed = await hash(payload, 10);
    return hashed;
  }

  public async compareHash(payload: string, hashed: string): Promise<boolean> {
    const passwordMatched = await compare(payload, hashed);
    return passwordMatched;
  }
}
