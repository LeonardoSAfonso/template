import { sign } from 'jsonwebtoken';
import { User } from '@prisma/client';
import { secret, expiresIn } from '../../../config/Auth';
import IUserRepository from '../repositories/IUserRepository';
import IHashProvider from '../../../shared/providers/hashProvider/model/IHashProvider';
import AppError from '../../../shared/errors/AppError';

interface IRequest {
  email: string;
  password: string;
}
interface IResponse extends User {
  token: string;
}
export default class AuthenticateUserService {
  private userRepository: IUserRepository;

  private hashProvider: IHashProvider;

  constructor(userRepository: IUserRepository, hashProvider: IHashProvider) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }

  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('ERRO: E-mail ou senha incorretos', 401);
    }

    if (user.password) {
      const passwordMatched = await this.hashProvider.compareHash(
        password,
        user.password,
      );

      if (!passwordMatched) {
        throw new AppError('ERRO: E-mail ou senha incorretos', 401);
      }
    }

    if (!user.email_checked) {
      throw new AppError('ERRO: E-mail não verificado', 401);
    }

    if (user.first_access) {
      await this.userRepository.update(user.id, { first_access: false });
    }

    const token = sign({}, secret, {
      subject: `${user.id}/${user.access_level}`,
      expiresIn,
    });
    return { ...user, token };
  }
}
