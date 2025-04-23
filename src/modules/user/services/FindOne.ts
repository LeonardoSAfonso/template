import { User } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import UserRepository from '../infra/Repository';

export default class FindOneUserService {
  constructor(private repository: UserRepository) {
    this.repository = repository;
  }

  public async execute(id: number): Promise<User> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    return user;
  }
}
