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
    storeData: UpdateDTO<User>,
    session: SessionInfo,
  ): Promise<User> {
    const store = await this.repository.findById(id);

    if (!store) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    if (storeData.email) {
      const checkUserEmailExist = await this.repository.findByEmail(
        storeData.email,
        session.storeId,
      );

      if (checkUserEmailExist && storeData.email !== store.email) {
        throw new AppError(
          'ERRO: O endereço de e-mail já está sendo utilizado',
          409,
        );
      }
    }

    const updatedUser = await this.repository.update(store.id, storeData);

    return updatedUser;
  }
}
