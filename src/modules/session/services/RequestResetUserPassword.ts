import { sign } from 'jsonwebtoken';
import path from 'path';
import { secret, expiresIn } from '../../../config/Auth';
import AppError from '../../../shared/errors/AppError';
import MailerProvider from '../../../shared/providers/Mailer';
import UserRepository from '../../user/infra/Repository';

export default class RequestResetUserPasswordService {
  constructor(
    private userRepository: UserRepository,
    private mailProvider: MailerProvider,
  ) {
    this.userRepository = userRepository;
    this.mailProvider = mailProvider;
  }

  public async execute(
    email: string,
    storeId: number,
    link: string,
  ): Promise<string> {
    const user = await this.userRepository.findByEmail(email, storeId);

    if (!user) {
      throw new AppError('ERRO: Nenhum usuário foi encontrado.', 404);
    }

    const token = sign({}, secret, {
      subject: `${user.id}`,
      expiresIn,
    });

    const requestResetsTemplate = path.resolve(
      __dirname,
      '..',
      'templates',
      'req_reset_password.hbs',
    );

    await this.mailProvider
      .sendMail({
        to: {
          name: user.name,
          email,
        },
        subject: 'Alteração de Senha',
        templateData: {
          variables: {
            name: user.name,
            link: `${link}?token=${token}`,
          },
          file: requestResetsTemplate,
        },
      })
      .catch(err => {
        throw new AppError(err);
      });

    try {
      await this.userRepository.update(user.id, {
        forgotten_token: token,
      });
    } catch (err) {
      throw new AppError(`ERRO: ${err}`, 409);
    }

    return 'Solicitação de reset de senha enviada com sucesso';
  }
}
