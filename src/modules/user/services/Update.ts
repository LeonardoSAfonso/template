import { User } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import UserRepository from '../infra/Repository';
import { UpdateDTO } from '../../../types/model.type';
import SessionInfo from '../../../types/sessionInfo';

export default class UpdateUserService {
  constructor(private repository: UserRepository) {
    this.repository = repository;
  }

  public async execute(
    id: number,
    userData: UpdateDTO<User>,
    session: SessionInfo,
  ): Promise<User> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    if (userData.email) {
      const checkUserEmailExist = await this.repository.findByEmail(
        userData.email,
        session.storeId,
      );

      if (checkUserEmailExist && userData.email !== user.email) {
        throw new AppError(
          'ERRO: O endereço de e-mail já está sendo utilizado',
          409,
        );
      }
    }

    const updatedUser = await this.repository.update(user.id, userData);

    return updatedUser;
  }
}
