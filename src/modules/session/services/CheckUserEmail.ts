import { verify } from 'jsonwebtoken';
import { secret } from '../../../config/Auth';
import AppError from '../../../shared/errors/AppError';
import UserRepository from '../../user/infra/Repository';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default class CheckUserEmailService {
  constructor(private userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(email: string): Promise<string> {
    const decoded = verify(email, secret);
    const { sub } = decoded as TokenPayload;

    const user = await this.userRepository.findById(Number(sub));

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    await this.userRepository.update(user.id, { email_checked: true });

    return 'E-mail validado com sucesso';
  }
}
