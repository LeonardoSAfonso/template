import path from 'path';
import AppError from '../shared/errors/AppError';
import MailerProvider from '../shared/providers/Mailer';

export default class RequestSupportService {
  constructor(private mailProvider: MailerProvider) {
    this.mailProvider = mailProvider;
  }

  public async execute(
    clientName: string,
    storeEmail: string,
    storePhone: string,
    emailBody: string,
  ): Promise<string> {
    const requestSuportTemplate = path.resolve(
      __dirname,
      '..',
      'templates',
      'request_support.hbs',
    );

    await this.mailProvider
      .sendMail({
        to: {
          name: 'generic',
          email: 'suporte@generic.com.br',
        },
        subject: 'Solicitação de Suporte',
        templateData: {
          variables: {
            clientName,
            storeEmail,
            storePhone,
            emailBody,
          },
          file: requestSuportTemplate,
        },
      })
      .catch(err => {
        throw new AppError(err);
      });

    return 'Solicitação de suport enviada com sucesso';
  }
}
