import { User } from '@prisma/client';
import AppError from '../../../shared/errors/AppError';
import IUserRepository from '../repositories/IUserRepository';

export default class FindAllUsersService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(
    access_level: number,
    offset: number,
    limit: number,
  ): Promise<[User[], number]> {
    const users = await this.userRepository.findAll(
      access_level,
      offset,
      limit,
    );

    if (!users[0]?.length) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    const totalPage =
      users[1] % limit === 0
        ? users[1] / limit
        : parseInt(`${users[1] / limit}`, 10) + 1;

    return [users[0], totalPage];
  }
}
