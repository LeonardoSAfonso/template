import bcrypt from 'bcryptjs';
import AppError from '../../../shared/errors/AppError';
import IHashProvider from '../../../shared/providers/hashProvider/model/IHashProvider';
import IUserRepository from '../repositories/IUserRepository';

export default class ChangePasswordUserService {
  private userRepository: IUserRepository;

  private hashProvider: IHashProvider;

  constructor(userRepository: IUserRepository, hashProvider: IHashProvider) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }

  public async execute(
    access_level: number,
    oldPassword: string,
    newPassword: string,
    userId: number,
  ): Promise<string> {
    const user = await this.userRepository.findById(userId, access_level);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    if (user.password) {
      if (!(await bcrypt.compare(oldPassword, user.password))) {
        throw new AppError('Senha inválida', 400);
      }
    }

    if (oldPassword === newPassword) {
      throw new AppError('ERRO: A nova senha deve ser diferente da atual');
    }

    const hashed = await this.hashProvider.generateHash(newPassword);

    await this.userRepository.update(user.id, { password: hashed });

    return 'A senha foi alterada com sucesso';
  }
}
