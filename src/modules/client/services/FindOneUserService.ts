import { User } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import IUserRepository from '../repositories/IUserRepository';

export default class FindOneUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(id: number, access_level: number): Promise<User> {
    const user = await this.userRepository.findById(id, access_level);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    return user;
  }
}
