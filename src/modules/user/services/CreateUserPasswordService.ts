import AppError from '../../../shared/errors/AppError';
import IHashProvider from '../../../shared/providers/hashProvider/model/IHashProvider';
import IUserRepository from '../repositories/IUserRepository';

export default class CreateUserPasswordService {
  private userRepository: IUserRepository;

  private hashProvider: IHashProvider;

  constructor(userRepossitory: IUserRepository, hashProvider: IHashProvider) {
    this.userRepository = userRepossitory;
    this.hashProvider = hashProvider;
  }

  public async execute(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    if (user.password) {
      throw new AppError(`ERRO: O usuário já possui senha cadastrada.`, 409);
    }

    const hashed = await this.hashProvider.generateHash(password);

    await this.userRepository.update(user.id, {
      password: hashed,
      email_checked: true,
    });

    return 'Senha Cadastrada com sucesso.';
  }
}
