import { verify } from 'jsonwebtoken';
import { secret } from '../../../config/Auth';
import AppError from '../../../shared/errors/AppError';
import HashProvider from '../../../shared/providers/Hash';
import UserRepository from '../../user/infra/Repository';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default class ResetUserPasswordService {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
  ) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }

  public async execute(token: string, password: string): Promise<string> {
    const decoded = verify(token, secret);
    const { sub } = decoded as TokenPayload;

    const user = await this.userRepository.findById(Number(sub));

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
