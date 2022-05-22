import { sign } from 'jsonwebtoken';
import path from 'path';
import { expiresIn, secret } from '../../../config/Auth';
import AppError from '../../../shared/errors/AppError';
import IMailProvider from '../../../shared/providers/MailProvider/model/IMailProvider';
import IUserRepository from '../repositories/IUserRepository';

export default class RequestResetUserPasswordService {
  private userRepository: IUserRepository;

  private mailProvider: IMailProvider;

  constructor(userRepository: IUserRepository, mailprovider: IMailProvider) {
    this.userRepository = userRepository;
    this.mailProvider = mailprovider;
  }

  public async execute(email: string, link: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

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
        throw new AppError(err, 409);
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
