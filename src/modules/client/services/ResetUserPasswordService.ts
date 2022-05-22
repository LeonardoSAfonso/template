import { verify } from 'jsonwebtoken';
import { secret } from '../../../config/Auth';
import AppError from '../../../shared/errors/AppError';
import IHashProvider from '../../../shared/providers/hashProvider/model/IHashProvider';
import IUserRepository from '../repositories/IUserRepository';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default class ResetUserPasswordService {
  private userRepository: IUserRepository;

  private hashProvider: IHashProvider;

  constructor(userRepository: IUserRepository, hashProvider: IHashProvider) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }

  public async execute(token: string, password: string): Promise<string> {
    const decoded = verify(token, secret);
    const { sub } = decoded as TokenPayload;

    const user = await this.userRepository.findById(Number(sub), 0);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    if (user.forgotten_token !== token) {
      throw new AppError('ERRO: Token Inválido.', 404);
    }

    const hashed = await this.hashProvider.generateHash(password);

    await this.userRepository.update(user.id, { password: hashed });

    return 'Senha alterada com sucesso.';
  }
}
