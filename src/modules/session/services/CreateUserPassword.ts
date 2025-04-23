import AppError from '../../../shared/errors/AppError';
import HashProvider from '../../../shared/providers/Hash';
import UserRepository from '../../user/infra/Repository';

export default class CreateUserPasswordService {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
  ) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }

  public async execute(
    email: string,
    password: string,
    storeId: number,
  ): Promise<string> {
    const user = await this.userRepository.findByEmail(email, storeId);

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
