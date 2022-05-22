import AppError from '../../../shared/errors/AppError';
import IStorageProvider from '../../../shared/providers/storageProvider/model/IStorageProvider';
import IUserRepository from '../repositories/IUserRepository';

export default class DeleteUserservice {
  private userRepository: IUserRepository;

  private storageProvider: IStorageProvider;

  constructor(
    userRepository: IUserRepository,
    storageProvider: IStorageProvider,
  ) {
    this.userRepository = userRepository;
    this.storageProvider = storageProvider;
  }

  public async execute(id: number, access_level: number): Promise<string> {
    const checkUserExist = await this.userRepository.findById(id, access_level);

    if (!checkUserExist) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    if (access_level <= 1) {
      const user = await this.userRepository.delete(id);

      return user;
    }

    if (access_level === 2 && checkUserExist.access_level <= 2) {
      throw new AppError('Essa ação precisa de mais privilégios.', 403);
    }

    const user = await this.userRepository.delete(id);

    return user;
  }
}
