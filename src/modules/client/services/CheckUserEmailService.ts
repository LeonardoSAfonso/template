import { verify } from 'jsonwebtoken';
import { secret } from '../../../config/Auth';
import AppError from '../../../shared/errors/AppError';
import IUserRepository from '../repositories/IUserRepository';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default class CheckUserEmailService {
  private userRepository: IUserRepository;

  constructor(userRepossitory: IUserRepository) {
    this.userRepository = userRepossitory;
  }

  public async execute(email: string): Promise<string> {
    const decoded = verify(email, secret);
    const { sub } = decoded as TokenPayload;

    const user = await this.userRepository.findByEmail(sub);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    await this.userRepository.update(user.id, { email_checked: true });

    return 'E-mail validado com sucesso';
  }
}
