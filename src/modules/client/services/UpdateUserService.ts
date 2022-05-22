import { User } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import IUpdateUserDTO from '../dtos/IUpdateUserDTO';
import IUserRepository from '../repositories/IUserRepository';

export default class UpdateUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(
    id: number,
    { name, email, access_level }: IUpdateUserDTO,
    user_access: number,
  ): Promise<User> {
    const user = await this.userRepository.findById(id, user_access);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    if (email) {
      const checkUserEmailExist = await this.userRepository.findByEmail(email);

      if (checkUserEmailExist && email !== user.email) {
        throw new AppError(
          'ERRO: O endereço de e-mail já está sendo utilizado',
          409,
        );
      }
    }

    const updatedUser = await this.userRepository.update(user.id, {
      name,
      email,
      access_level,
    });

    return updatedUser;
  }
}
