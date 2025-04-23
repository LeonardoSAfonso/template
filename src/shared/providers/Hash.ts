import { compare, hash } from 'bcryptjs';

export default class HashProvider {
  public async generateHash(payload: string): Promise<string> {
    const hashed = await hash(payload, 10);
    return hashed;
  }

  public async compareHash(payload: string, hashed: string): Promise<boolean> {
    const passwordMatched = await compare(payload, hashed);
    return passwordMatched;
  }
}
