import bcrypt from 'bcryptjs';
import AppError from '../../../shared/errors/AppError';
import HashProvider from '../../../shared/providers/Hash';
import UserRepository from '../../user/infra/Repository';

export default class ChangePasswordUserService {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
  ) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }

  public async execute(
    oldPassword: string,
    newPassword: string,
    userId: number,
  ): Promise<string> {
    const user = await this.userRepository.findById(userId);

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
