import { User } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import UserRepository from '../infra/Repository';
import SessionInfo from '../../../types/sessionInfo';

export default class DeleteUserservice {
  constructor(private repository: UserRepository) {
    this.repository = repository;
  }

  public async execute(id: number, session: SessionInfo): Promise<User> {
    const checkUserExist = await this.repository.findById(id);

    if (!checkUserExist) {
      throw new AppError('ERRO: Nenhum usuário foi encontrada.', 404);
    }

    if (session.access_level <= 1) {
      const user = await this.repository.delete(id);

      return user;
    }

    if (session.access_level === 2 && checkUserExist.access_level <= 2) {
      throw new AppError('Essa ação precisa de mais privilégios.', 403);
    }

    return this.repository.delete(id);
  }
}
