import { User } from '@prisma/client';
import path from 'path';
import AppError from '../../../shared/errors/AppError';
import IHashProvider from '../../../shared/providers/hashProvider/model/IHashProvider';
import IMailProvider from '../../../shared/providers/MailProvider/model/IMailProvider';
import ICreateUserDTO from '../dtos/ICreateUseDTO';
import IUserRepository from '../repositories/IUserRepository';

export default class CreateUserService {
  constructor(
    private userRepository: IUserRepository,
    private hashProvider: IHashProvider,
    private mailProvider: IMailProvider,
  ) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
    this.mailProvider = mailProvider;
  }

  public async execute(
    { name, email, password, access_level }: ICreateUserDTO,
    appName: string,
    link: string,
  ): Promise<User> {
    const checkUserEmailExist = await this.userRepository.findByEmail(email);

    if (checkUserEmailExist) {
      throw new AppError(
        'ERRO: O endereço de e-mail já está sendo utilizado',
        409,
      );
    }

    let user: User;

    if (password) {
      const hashed = await this.hashProvider.generateHash(password);

      user = await this.userRepository.create({
        name,
        email,
        password: hashed,
        access_level,
      });
    } else {
      user = await this.userRepository.create({
        name,
        email,
        access_level,
      });
    }

    if (access_level > 0) {
      const createPasswordTemplate = path.resolve(
        __dirname,
        '..',
        'templates',
        'create_password.hbs',
      );

      await this.mailProvider
        .sendMail({
          to: {
            name,
            email,
          },
          subject: 'Confirmação de Cadastro',
          templateData: {
            variables: {
              name,
              link,
            },
            file: createPasswordTemplate,
          },
        })
        .catch((err: string) => {
          throw new AppError(err, 409);
        });
    }

    return user;
  }
}
