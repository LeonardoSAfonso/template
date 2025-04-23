import { User } from '@prisma/client';
import path from 'path';
import AppError from '../../../shared/errors/AppError';
import { CreateDTO } from '../../../types/model.type';
import UserRepository from '../infra/Repository';
import HashProvider from '../../../shared/providers/Hash';
import MailerProvider from '../../../shared/providers/Mailer';
import SessionInfo from '../../../types/sessionInfo';

export default class CreateUserService {
  constructor(
    private repository: UserRepository,
    private hashProvider: HashProvider,
    private mailProvider: MailerProvider,
  ) {
    this.repository = repository;
    this.hashProvider = hashProvider;
    this.mailProvider = mailProvider;
  }

  public async execute(
    userData: CreateDTO<User>,
    session: SessionInfo,
  ): Promise<User> {
    const checkUserEmailExist = await this.repository.findByEmail(
      userData.email,
      session.storeId,
    );

    if (checkUserEmailExist) {
      throw new AppError(
        'ERRO: O endereço de e-mail já está sendo utilizado',
        409,
      );
    }

    let user: User;

    if (userData.password) {
      const hashed = await this.hashProvider.generateHash(userData.password);

      user = await this.repository.create({
        ...userData,
        password: hashed,
      });
    } else {
      user = await this.repository.create(userData);
    }

    if (userData.access_level > 0) {
      const createPasswordTemplate = path.resolve(
        __dirname,
        '..',
        'templates',
        'create_password.hbs',
      );

      await this.mailProvider
        .sendMail({
          to: {
            name: user.name,
            email: user.email,
          },
          subject: 'Confirmação de Cadastro',
          templateData: {
            variables: {
              name: user.name,
              link: '/panel/generate-pass',
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
